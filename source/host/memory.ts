/* ------------
     memory.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Memory {

        constructor(private memory: Array<string> = null) {
            this.memory = new Array<string>(MEMORY_LENGTH);
        }

        public init(): void {
            for (let i = 0; i < this.memory.length; i++){
                this.memory[i] = "00";
            }
        }

        getMemory(address:number): string{
            return this.memory[Utils.hexToDec(address)];
        }

        setMemory(address:number, val: string): boolean{
            try{
                this.memory[Utils.hexToDec(address)] = val;
            } catch (e){
                _Kernel.krnTrace("Unable to set memory address " + address + " to " + val);
                return false;
            }
            return true;
        }

        clearMemory(): void {
            for (let i = 0; i < this.memory.length; i++){
                this.memory[i] = "00";
            }
        }
    }
}