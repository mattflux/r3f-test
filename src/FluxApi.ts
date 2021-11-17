class FluxApi {
    test: string;
    setMessage: any;
    constructor(setMessage: any) {
        this.test = "";
        this.setMessage = setMessage;
        
    }
    public print(output: string) {
        this.setMessage(output);
    }
    public static yo() {
        
    }
}

export default FluxApi;
