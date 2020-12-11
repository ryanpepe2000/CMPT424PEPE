/* ------------
     memory.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Memory {
        memory: Array<string>;
        constructor() {
            this.memory = new Array<string>(MEMORY_LENGTH * MEMORY_BLOCKS);
        }

        public init(): void {
            this.initMemory();
            Control.initMemoryDisplay();
        }

        // Initial setting of memory
        initMemory(): void {
            for (let i = 0; i < this.memory.length; i++){
                this.memory[i] = "00";
            }
        }

        // Used to reset the values of every bit in memory
        resetMemory(): void {
            for (let i = 0; i < this.memory.length; i++){
                this.setMemory(i, "00");
            }
            for (let i = 0; i < _MMU.availableSegments.length; i++){
                _MMU.emptySegment(i);
            }
        }

        // Methods to be used by memory accessor
        getMemory(address: string): string{
            let val = ("00" + this.memory[Utils.removePad(address)]).replace(/^0+/, "");
            if (val.length === 1) {
                val = "0" + val;
            } else if (val.length == 0){
                val = "00";
            }
            return val;
        }
        setMemory(address:number, val: string): boolean{
            try{
                this.memory[address] = val;
            } catch (e){
                _Kernel.krnTrace("Unable to set memory address " + address + " to " + val);
                return false;
            }
            return true;
        }
    }
}