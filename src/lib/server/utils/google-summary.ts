import { attemptAsync } from "ts-utils/check";
import { Team } from "./tba";
import type { z } from "zod";

export const summarize = async (event: string) => {
    return attemptAsync(async () => {
        return new Table(event);
    });
};


class Table {
    public readonly columns: Column<unknown>[] = [];
    public readonly rows: Row[] = [];

    constructor(public readonly name: string) {}

    public column<T>(name: string, zodType: z.ZodType<T>): Column<T> {
        const c = new Column<T>(this, name, zodType, this.columns.length);
        this.columns.push(c);
        this.rows.forEach(r => r.cell(c));
        return c;
    }

    public row(team: Team): Row {
        const r = new Row(this, team, this.rows.length);
        this.rows.push(r);
        return r;
    }

    serialize() {
        return [
            this.columns.map(c => c.name),
            ...this.rows.map(r => r.cells.map(c => c.value)),
        ]
    }
}

class Column<T> {
    constructor(public readonly table: Table, public readonly name: string, public readonly zodType: z.ZodType, public readonly index: number) {}

    get cells() {
        return this.table.rows.map(r => r.cells[this.index]) as Cell<T>[];
    }
}

class Row {
    public readonly cells: Cell<unknown>[] = [];

    constructor(public readonly table: Table, public readonly team: Team, public readonly index: number) {}

    public cell<T>(column: Column<T>): Cell<T> {
        const c = new Cell(this, column);
        this.cells.push(c);
        return c;
    }
}

class CellError extends Error {
    constructor(public readonly cell: Cell<unknown>, public readonly message: string) {
        super(
            `Error in ${cell.table.name}.${cell.column.name} | ${cell.row.team.tba.team_number}:${cell.value} | ${message}`
        );
    }
}

class Cell<T> {
    _value: T | undefined;
    constructor(public readonly row: Row, public readonly column: Column<T>) {}

    public get table() {
        return this.row.table;
    }

    public get value(): T | undefined {
        return this._value;
    }

    public set value(value: T) {
        if (this.value !== undefined) throw new CellError(this, "Value already set. Cannot overwrite with : " + value);
        const parsed = this.column.zodType.safeParse(value);
        
        if (!parsed.success) throw new CellError(this, `Invalid value: ${parsed.error.message}`);
        this._value = value;
    }
}