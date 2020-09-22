/* ------------
     memoryManager.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    export class MemoryManager {
        constructor() {
        }

        public static memoryAvailable(programLength: number): boolean{
            if (programLength > _Memory.memory.length) return false;
            for (let i = 0; i < _Memory.memory.length; i++){
                if (_Memory.getMemory(i.toString()) !== "00") return false;
            }
            return true;
        }
    }
}