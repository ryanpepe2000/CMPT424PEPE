/* ----------------------------------
   HardDrive.ts

   ---------------------------------- */
module TSOS{
    export class HardDrive{
        // Size of hard drive components (TSB and block size)
        private numTracks;
        private numSectors;
        private numBlocks;
        private blockLength;

        constructor() {
        }

        public init(numTracks: number, numSectors: number, numBlocks: number, blockLength: number): void {
            this.numTracks = numTracks;
            this.numSectors = numSectors;
            this.numBlocks = numBlocks;
            this.blockLength = blockLength;
        }

        /**
         * write
         *
         * Writes to HTML5 Session storage
         *
         * @param track
         * @param sector
         * @param block
         * @param value
         */
        public write(track:number, sector:number, block:number, value:string): void {
            let key = this.translateKey(track,sector,block);
            sessionStorage.setItem(key, value);
        }

        /**
         * read
         *
         * Reads from HTML5 Session Storage
         * @param track
         * @param sector
         * @param block
         */
        public read(track:number, sector:number, block:number): string {
            let key = this.translateKey(track,sector,block);
            return sessionStorage.getItem(key);
        }

        /**
         * translateKey
         *
         * Translates a track, sector, and block to the key format we will be using in the OS HardDrive
         * Ex: Track 5, Sector 2, Block 1 => "5:2:1"
         *
         * @param track
         * @param sector
         * @param block
         */
        public translateKey(track: number, sector: number, block: number): string{
            return track + ":" + sector + ":" + block;
        }

        public getTracks(): number {
            return this.numTracks;
        }
        public getSectors(): number {
            return this.numSectors;
        }
        public getBlocks(): number {
            return this.numBlocks;
        }
        public getBlockSize(): number {
            return this.blockLength;
        }
    }
}