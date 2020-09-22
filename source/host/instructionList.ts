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
    }
}