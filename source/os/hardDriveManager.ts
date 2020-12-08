module TSOS {
    /**
     * HardDriveManager
     *
     * **NOTE**
     * This class functions only as a LOGICAL extension of the hard drive device driver
     * It contains helper functions and metadata necessary to perform disk operations.
     */
    export class HardDriveManager {
        // Initialize meta constants
        private readonly NUM_TRACKS = 4;
        private readonly NUM_SECTORS = 8;
        private readonly NUM_BLOCKS = 8;
        private readonly BLOCK_LENGTH = 64;
        private readonly HEADER_LENGTH = 4;
        private readonly BODY_LENGTH = this.BLOCK_LENGTH - this.HEADER_LENGTH;

        // Directory and File Storage Size
        private readonly DIR_TRACKS = 1;
        private readonly FILE_TRACKS = this.NUM_TRACKS - this.DIR_TRACKS;

        // Master Boot Record Constants
        private readonly MBR_NEXT_DIR_LOC = [0,3];
        private readonly MBR_NEXT_FILE_LOC = [3,6];

        // Hard Drive object to be used by the manager
        private hardDrive: HardDrive;


        // Logical dictionary mapping filenames to location keys
        public filenameDict: {} = {};

        /**
         * HardDriveManager Constructor
         *
         * Constructor for a hard drive manager. Links to the System's hard drive hardware
         * and acts as a layer between hardware (HardDrive) and OS (Control)
         *
         */
        constructor() {
            // Initialize the hardDrive with proper lengths for TSB and block size
            this.hardDrive = _HardDrive;
            this.hardDrive.init(this.NUM_TRACKS, this.NUM_SECTORS, this.NUM_BLOCKS, this.BLOCK_LENGTH);
        }

        /**
         * init
         *
         * Initializes the Hard Drive and Hard Drive Manager
         *
         */
        public init() {
            // Write zeros to the session storage
            for (let i = 0; i < this.hardDrive.getTracks(); i++){
                for (let j = 0; j < this.hardDrive.getSectors(); j++){
                    for (let k = 0; k < this.hardDrive.getBlocks(); k++){
                        // DO NOT use this.write() here or the Control will update the display i * j * k times
                        let value = Utils.asciiToDiskText("", this.hardDrive.getBlockSize());
                        this.hardDrive.write(i, j, k, value);
                    }
                }
            }
            this.setHead(0,0,0, "1000");
            this.setBody(0,0,0,"001100");
            // Updates the HD display with the newly initialized values
            Control.updateHDDisplay();
        }

        /**
         * Getters and Setters for Head/Body of Disk Entry
         */
        public setHead(track:number, sector:number, block:number, head:string): void {
            let diskEntry = this.read(track, sector, block);
            let body = diskEntry.slice(this.HEADER_LENGTH);
            let newEntry = head + body;
            this.write(track, sector, block, newEntry);
        }
        public getHead(track, sector, block): string {
            let diskEntry = this.read(track, sector, block);
            return diskEntry.slice(0, this.HEADER_LENGTH);
        }
        public setBody(track, sector, block, body): void {
            let diskEntry = this.read(track, sector, block);
            let head = diskEntry.slice(0, this.HEADER_LENGTH);
            let newEntry = head + body;
            this.write(track, sector, block, newEntry);
        }
        public getBody(track, sector, block): string {
            let diskEntry = this.read(track, sector, block);
            return diskEntry.slice(this.HEADER_LENGTH);
        }
        public getTSB(key: string): number[] {
            let tsb = key.split(":");
            return [parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2])];
        }

        /**
         * Getters / Setters for MBR meta info
         */
        public getOpenDirKey(): string {
            // Get MBR content
            let content = this.getBody(0,0,0);
            return content.slice(this.MBR_NEXT_DIR_LOC[0], this.MBR_NEXT_DIR_LOC[1]).split("").join(":");
        }
        public updateOpenDirKey(dirKey: string): void {
            dirKey = dirKey.split(":").join("");
            let diskEntry = this.getBody(0,0,0);
            let end = diskEntry.slice(this.MBR_NEXT_DIR_LOC[1]);
            diskEntry = dirKey + end;
            this.setBody(0,0,0, diskEntry);
        }
        public getOpenFileKey(): string {
            // Get MBR content
            let content = this.getBody(0,0,0);
            return content.slice(this.MBR_NEXT_FILE_LOC[0], this.MBR_NEXT_FILE_LOC[1]).split("").join(":");
        }
        public updateOpenFileKey(fileKey: string): void {
            fileKey = fileKey.split(":").join("");
            let diskEntry = this.getBody(0,0,0);
            let start = diskEntry.slice(0, this.MBR_NEXT_DIR_LOC[1]);
            let end = diskEntry.slice(this.MBR_NEXT_FILE_LOC[1]);
            diskEntry = start + fileKey + end;
            this.setBody(0,0,0, diskEntry);
        }

        /**
         * findOpenDir
         *
         * Search through directory to find the next open location for a filename
         */
        public findOpenDirKey(): string {
            for (let i = 0; i < this.DIR_TRACKS; i++){
                for (let j = 0; j < this.NUM_SECTORS; j++){
                    for (let k = 0; k < this.NUM_BLOCKS; k++){
                        let head = this.getHead(i,j,k);
                        if (head.charAt(0) === "0" || head === ""){ // Might be able to remove second part
                            return i + ":" + j + ":" + k;
                        }
                    }
                }
            }
        }

        /**
         * findOpenFile
         *
         * Search through directory to find the next open location for a file
         */
        public findOpenFileKey(): string {
            for (let i = this.DIR_TRACKS; i < this.FILE_TRACKS; i++){
                for (let j = 0; j < this.NUM_SECTORS; j++){
                    for (let k = 0; k < this.NUM_BLOCKS; k++){
                        let head = this.getHead(i,j,k);
                        if (head.charAt(0) === "0" || head === ""){ // Might be able to remove second part
                            return i + ":" + j + ":" + k;
                        }
                    }
                }
            }
        }

        /**
         * write
         *
         * Calls the hard drives built-in write method
         */
        public write(track: number, sector: number, block: number, value:string): void {
            let formattedHex = Utils.asciiToDiskText(value, this.hardDrive.getBlockSize());
            this.hardDrive.write(track, sector, block, formattedHex);
            // Update the memory display whenever something is being written
            Control.updateHDDisplay();
        }

        /**
         * read
         *
         * Calls the hard drives built-in read method
         */
        public read(track: number, sector: number, block: number): string {
            // Convert disk-formatted hexadecimal to the ascii code
            return Utils.diskTextToAscii(this.hardDrive.read(track, sector, block).replace(/(00)+$/, ""));
        }

        /**
         * readNoFormat
         *
         * To be used by the Control. Allows for custom Ascii / Hex encoding
         */
        public readNoFormat(track: number, sector: number, block: number): string {
            // Convert disk-formatted hexadecimal to the ascii code
            return this.hardDrive.read(track, sector, block);
        }
        /**
         * getTracks
         */
        public getTracks(): number {
            return this.hardDrive.getTracks();
        }

        /**
         * getSectors
         */
        public getSectors(): number {
            return this.hardDrive.getSectors();
        }

        /**
         * getBlocks
         */
        public getBlocks(): number {
            return this.hardDrive.getBlocks();
        }

        /**
         * getBlockSize
         */
        public getBlockSize(): number {
            return this.hardDrive.getBlockSize();
        }

        /**
         * findDir
         *
         * Searches for directory name in map and returns the key of that location
         * @param filename
         */
        public findDir(filename: string): string {
            let key = this.filenameDict[filename];
            if (key === undefined){
                return null;
            } else {
                return key;
            }
        }
        cascadeUnset(diskEntryTSB: string, diskEntryHead: string){
            let thisTSB = diskEntryTSB.split("");
            let nextTSB = diskEntryHead.slice(1);
            let tsb = nextTSB.split("");
            alert(nextTSB);
            if (nextTSB === "000"){
                _HardDriveManager.setHead(parseInt(thisTSB[0]),parseInt(thisTSB[1]),parseInt(thisTSB[2]), "0" + nextTSB);
                return;
            } else {
                _HardDriveManager.setHead(parseInt(thisTSB[0]),parseInt(thisTSB[1]),parseInt(thisTSB[2]), "0" + nextTSB);
                this.cascadeUnset(nextTSB, _HardDriveManager.getHead(parseInt(tsb[0]),parseInt(tsb[1]),parseInt(tsb[2])));
            }
        }
    }
}