type GoogleTableCol = {
  id: string;
  label: string;
  type: string;
  pattern?: "string" | "number" | "boolean" | "date" | "datetime" | "timeofday";
};

type GoogleTableCell = {
  v: string | number | boolean | null;
  f?: string;
} | null;

type GoogleTableRow = {
  c: GoogleTableCell[];
};

type GoogleTable = {
  cols: GoogleTableCol[];
  rows: GoogleTableRow[];
  parsedNumHeaders: number;
};

type GoogleTableResponse = {
  version: string;
  reqId: string;
  status: string;
  sig: string;
  errors?: { reason: string; message: string; detailed_message: string }[];
  table?: GoogleTable;
};

type SheetToJsonResponse<T> = {
  data: T[];
  dataFormated: Record<keyof T, string>[];
};

export async function sheetToJson<T>(
  idFile: string,
  idSheet: string = "0"
): Promise<SheetToJsonResponse<T> | null> {
  try {
    const endpoint: string = `https://docs.google.com/spreadsheets/d/${idFile}/gviz/tq?tqx=out:json&gid=${idSheet}`;
    const googleQueryFormat: string[] = [
      "google.visualization.Query.setResponse({",
      "});",
    ];

    const res = await fetch(endpoint, {
      headers: { "cache-control": "no-cache" },
    });

    if (!res.ok) {
      throw new Error(`Fetch Error: ${res.status} - ${res.statusText}`);
    }

    const json = await res.text();

    if (json.indexOf(googleQueryFormat[0]) === -1) {
      throw new Error(
        "Fetch Error: Invalid Google JSON Format, please check the idFile and idSheet"
      );
    }

    const jsonParsed: GoogleTableResponse = JSON.parse(
      json.slice(
        json.indexOf(googleQueryFormat[0]) + googleQueryFormat[0].length - 1,
        json.lastIndexOf(googleQueryFormat[1]) + 1
      )
    );

    if (jsonParsed.status === "error" && jsonParsed.errors) {
      throw new Error(`Google Error: ${jsonParsed.errors[0].detailed_message}`);
    }

    if (jsonParsed.status === "ok" && jsonParsed.table) {
      const headers: string[] = jsonParsed.table.cols.map((col) => {
        let label = col.label.split(" ").map((word, i) => {
          if (i === 0) return word.toLowerCase();
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return label.join("");
      });

      const dataFormated: SheetToJsonResponse<T>["dataFormated"] = [];

      const data: T[] = jsonParsed.table.rows.map(({ c }) => {
        const objFormated: Record<string, any> = {};
        const obj: Record<string, any> = {};
        headers.forEach((header, i) => {
          if (header) {
            if (!c[i] || c[i].v === null) {
              obj[header] = null;
              objFormated[header] = null;
            } else {
              obj[header] = c[i].v;
              if (c[i].f) objFormated[header] = c[i].f;
              else objFormated[header] = c[i].v;
            }
          }
        });
        dataFormated.push(objFormated as any);
        return obj as T;
      });

      return { data, dataFormated };
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
