class Bit {
	constructor(parent) {
		this.x0 = parent.x0;
		this.y0 = parent.y0;
		this.name = "bod";

		this.y = parent.y;
		this.x = parent.x;


		if (this.x0 > 0) {
			this.x -= bitWidth;
		}
		if (this.x0 < 0) {
			this.x += bitWidth;
		}

		if (this.y0 > 0) {
			this.y -= bitWidth;
		}
		if (this.y0 < 0) {
			this.y += bitWidth;
		}
	}

	update(parent) {

		if (this.x0 > 0) {
			this.x += bitWidth;
		}
		if (this.x0 < 0) {
			this.x -= bitWidth;
		}
		if (this.y0 > 0) {
			this.y += bitWidth;
		}
		if (this.y0 < 0) {
			this.y -= bitWidth;
		}

		if (parent) {
			this.x0 = parent.x0;
			this.y0 = parent.y0;
		}
	}
}

export default Bit;
