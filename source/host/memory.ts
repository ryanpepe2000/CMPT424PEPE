/* ------------
     memory.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Memory {
        memory: Array<string>;
        constructor() {
            this.memory = new Array<string>(MEMORY_LENGTH);
        }

        public init(): void {
            for (let i = 0; i < this.memory.length; i++){
                this.memory[i] = "00";
            }
            Control.initMemoryDisplay();
        }

        getMemory(address: string): string{
            return this.memory[Utils.removePad(address)];
        }

        setMemory(address:number, val: string): boolean{
            try{
                this.memory[Utils.decToHex(address)] = val;
                Control.updateMemoryDisplay(Utils.decToHex(address));
            } catch (e){
                _Kernel.krnTrace("Unable to set memory address " + address + " to " + val);
                return false;
            }
            return true;
        }
    }
}