module TSOS {
    export class InstructionList {

    }
    export class Instruction {
        constructor(opCode: string,
                    mneumonic: string,
                    numParams: number,
                    pcIncrement: number,
                    callback:(params?: any) => any){
        }
    }
    export class InstructionFunction {
        constructor(){
        }

        private static loadAccConstant(params: string[]){
            _CPU.setAcc(Utils.hexToDec(params[0]));
        }

        private static loadAccMemory(params: string[]){
            let address = params[1] + params[0];
            _CPU.setAcc(Utils.hexToDec(_MemoryAccessor.readByte(address)));
        }

        private static addWithCarry(params: string[]){
            let address = params[1] + params[0];
            _CPU.setAcc(_CPU.getAcc() + Utils.hexToDec(_MemoryAccessor.readByte(address)))
        }

        private static loadXConstant(params: string[]){
            _CPU.setXReg(Utils.hexToDec(params[0]));
        }

        private static loadXMemory(params: string[]){
            let address = params[1] + params[0];
            _CPU.setXReg(Utils.hexToDec(_MemoryAccessor.readByte(address)));
        }

        private static loadYConstant(params: string[]){
            _CPU.setYReg(Utils.hexToDec(params[0]));
        }

        private static loadYMemory(params: string[]){
            let address = params[1] + params[0];
            _CPU.setYReg(Utils.hexToDec(_MemoryAccessor.readByte(address)));
        }

        private static noOperation(): void{
            return;
        }

        // Should be a system call
        private static break(): void {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(BREAK_PROCESS_IRQ, ["An error has occurred while processing user code"]));
        }

        private static compareXReg(params: string[]){
            let address = params[1] + params[0];
            Utils.hexToDec(_MemoryAccessor.readByte(address)) === _CPU.getXReg() ?
                _CPU.enableZFlag() : _CPU.disableZFlag();
        }

        public static branchBytes(params: string[]) {
            let numBytes: number = Utils.hexToDec(params[0]);
            _CPU.PC += numBytes;
            if (_CPU.PC > MEMORY_LENGTH){
                _CPU.PC = _CPU.PC % MEMORY_LENGTH;
            }
        }

        public static incrementValue(params: string[]) {
            let address = params[1] + params[0];
            if (_MemoryAccessor.readByte(address).toUpperCase() === "FF") this.break();
            _MemoryAccessor.writeByte(Utils.hexToDec(address),
                Utils.decToHex(Utils.hexToDec(_MemoryAccessor.readByte(address)) + 0x1).toUpperCase());
        }

        public static systemCall() {
            let retVal = "";
            if (_CPU.getXReg() === 1) {
                retVal += _CPU.getXReg();
            } else if (_CPU.getXReg() === 2) {
                let index = _CPU.getYReg();
                let val = _MemoryAccessor.readByte(Utils.decToHex(index));
                while(val !== "0" && val !== "00"){
                    retVal += String.fromCharCode(Utils.hexToDec(val));
                    index++;
                    val = _MemoryAccessor.readByte(Utils.decToHex(index));
                    console.log("Value: " + val);
                }
            }
            _KernelInterruptQueue.enqueue(new Interrupt(PRINT_PROCESS_IRQ, [retVal]));
        }
    }
}