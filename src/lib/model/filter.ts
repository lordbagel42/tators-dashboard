import { writable, type Writable } from 'svelte/store';

type F = {
	auto: boolean;
	teleop: boolean;
	endgame: boolean;
};

class Filter implements Writable<F> {
	private _auto = false;
	private _teleop = false;
	private _endgame = false;
    private _all = true;

	private readonly subscribers = new Set<(value: F) => void>();

	get data() {
		return {
			auto: this.auto,
			teleop: this.teleop,
			endgame: this.endgame
		};
	}

	public subscribe(fn: (value: F) => void) {
		this.subscribers.add(fn);
		fn(this.data);
		return () => this.subscribers.delete(fn);
	}

	inform() {
		this.subscribers.forEach((fn) => fn(this.data));
	}

	set(value: F) {
		this._auto = value.auto;
		this._teleop = value.teleop;
		this._endgame = value.endgame;
		this.inform();
	}

	update(fn: (value: F) => F) {
		this.set(fn(this.data));
	}

	get auto() {
		return this._auto;
	}

	get teleop() {
		return this._teleop;
	}

	get endgame() {
		return this._endgame;
	}

    get all() {
        return this._all;
    }

	set auto(value: boolean) {
		this._auto = value;
		this.inform();
	}

	set teleop(value: boolean) {
		this._teleop = value;
		this.inform();
	}

	set endgame(value: boolean) {
		this._endgame = value;
		this.inform();
	}

    set all(value: boolean) {
        if (value) {
            this._auto = false;
            this._teleop = false;
            this._endgame = false;
        }
        this._all = value;
        this.inform();
    }
}

export const globalFilter = new Filter();

globalFilter.subscribe(console.log);
