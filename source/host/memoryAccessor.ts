/* ------------
     memoryAccessor.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    export class MemoryAccessor {
        constructor() {
        }

        public readByte(address: string): string{
            return _Memory.getMemory(address);
        }

        public writeByte(address: number, value: string): boolean {
            return _Memory.setMemory(address, value);
        }

        // Calls the reset memory in TSOS.Memory
        // Strange bug was preventing calling TSOS.Memory.clearMemory()
        public clearMemory(){
            _Memory.resetMemory();
        }
    }
}