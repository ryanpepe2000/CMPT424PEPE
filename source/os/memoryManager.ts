/* ------------
     memoryManager.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    export class MemoryManager {
        public availableSegments: Array<boolean>;
        constructor() {
            this.availableSegments = new Array<boolean>(MEMORY_BLOCKS);
            for (let i = 0; i < MEMORY_BLOCKS; i++){
                this.availableSegments[i] = true;
            }
        }

        // Returns true if a memory segment is available (all memory is untaken)
        public memoryAvailable(): boolean{
            return this.availableSegments.indexOf(true) > -1;
        }

        public segmentAvailable(segment: number): boolean {
            return this.availableSegments[segment];
        }

        public getAvailableSegment(): number{
            return this.availableSegments.indexOf(true);
        }

        public translateAddress(address: number, segment: number): number{
            return ((segment * MEMORY_LENGTH) + address);
        }

        public fillSegment(segment: number, userCode: string[]){
            this.availableSegments[segment] = false;
            // Write bytes to proper memory block
            for (let i = 0; i < userCode.length - 1; i+=0x1){
                _MemoryAccessor.writeByte(_MMU.translateAddress(i, segment), userCode[i]);
            }
        }

        public readSegment(segment: number): string {
            let buffer: string = "";
            for (let i = 0; i < MEMORY_LENGTH; i++){
                buffer += _MemoryAccessor.readByte(Utils.decToHex(_MMU.translateAddress(i, segment)));
            }
            return buffer;
        }
        public writeSegment(segment: number, hexCode: string): void {
            for (let i = 0; i < MEMORY_LENGTH; i++){
                //_MemoryAccessor.writeByte(hex_MMU.translateAddress(i, segment));
            }
        }

        public emptySegment(segment: number){
            this.availableSegments[segment] = true;
        }
        public getSegmentBounds(segment: number){
            if (segment == 0) {
                return [0, MEMORY_LENGTH-1];
            } else if (segment == 1){
                return [MEMORY_LENGTH, (MEMORY_LENGTH*2)-1];
            } else if (segment == 2){
                return [(MEMORY_LENGTH*2), (MEMORY_LENGTH*3)-1];
            }
        }

        public getSegment(address: number){
            for (let i = 0; i < this.availableSegments.length; i++){
                let bounds = this.getSegmentBounds(i);
                if (address >= bounds[0] && address < bounds[1]){
                    return i;
                }
            }
            return -1;
        }

        public getLogicalAddress(address: number){
            let segment = this.getSegment(address);
            return this.translateAddress(address, segment);
        }
    }

}