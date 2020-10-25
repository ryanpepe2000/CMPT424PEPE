/* ------------
     memoryManager.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    export class MemoryManager {
        constructor() {
        }
        // Returns true if a memory segment is available (all memory is untaken)
        public static memoryAvailable(): boolean{
            for (let i = 0; i < MEMORY_BLOCKS; i++){
                if (MemoryManager.segmentAvailable(i)) return true;
            }
            return false;
        }

        public static segmentAvailable(segment: number): boolean {
            if (segment >= MEMORY_BLOCKS || segment < 0) return false;
            for (let i = (MEMORY_LENGTH * segment); i < (MEMORY_LENGTH * segment) + MEMORY_LENGTH - 1; i++){
                if (_Memory.getMemory(i.toString(16)) !== "00") return false;
            }
            return true;
        }

        public static getAvailableSegment(): number{
            for (let i = 0; i < MEMORY_BLOCKS; i++){
                if (this.segmentAvailable(i)) return i;
            }
            return -1;
        }

        public static translateAddress(address: number, segment: number): number{
            return ((segment * MEMORY_LENGTH) + address);
        }
    }
}