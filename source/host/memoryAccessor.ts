/* ------------
     memoryAccessor.ts

     These methods are to be accessed directly from the CPU. Therefore, the current segment status of the CPU
     will be used to translate the logical byte address to to physical address.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    export class MemoryAccessor {
        constructor() {
        }

        public readByte(address: string): string{
            console.log("Reading byte from address: " + address);
            return _Memory.getMemory(address);
        }

        public writeByte(address: number, value: string): boolean {
            console.log("Writing to byte: " + address);
            return _Memory.setMemory(address, value);
        }

        // Calls the reset memory in TSOS.Memory
        // Strange bug was preventing calling TSOS.Memory.clearMemory()
        public clearMemory(){
            _Memory.resetMemory();
        }
    }
}