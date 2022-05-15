class Controls {
    constructor(aiControllable) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
        if (!aiControllable) {
            this.forward = true;
        }
    }
}