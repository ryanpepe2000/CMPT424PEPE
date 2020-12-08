/* ----------------------------------
   DeviceDriverHardDrive.ts

   The Kernel Hard Drive Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHardDrive extends DeviceDriver {
        // Initialize a dictionary with operations and respective service routines
        private OPERATIONS =  {
            "create" : this.createFile,
            "read" : this.readFile,
            "write" : this.writeFile,
            "delete" : this.deleteFile,
            "format" : this.format,
            "list" : this.listFiles
        };

        public isValidOperation(operation: string){
            return this.OPERATIONS[operation] !== undefined;
        }

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();

            this.driverEntry = this.krnHDDriverEntry;
            this.isr = this.krnHDDispatch;
        }

        public krnHDDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        }

        public krnHDDispatch(params: string[]) {
            // Get name of disk operation and remove it from param list
            let operation = params[0];
            params = params.slice(1);
            // Check validity of operation
            if (this.isValidOperation(operation)){
                // Run the specified operation
                this.OPERATIONS[operation](params);
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid Disk Operation"]));
            }
        }

        public createFile(params) {
            let dirKey = _HardDriveManager.findDir(params[0]);
            // Key does not exist in the filenameDict
            if (dirKey === null){
                // Set new key in dict
                dirKey = _HardDriveManager.getOpenDirKey();
                _HardDriveManager.filenameDict[params[0]] = dirKey;
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                // Get next open file location and set it to in use
                let fileTSB = _HardDriveManager.getTSB(_HardDriveManager.getOpenFileKey());
                _HardDriveManager.setHead(fileTSB[0], fileTSB[1], fileTSB[2], "1000");
                // Write filename to directory entry
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "1" + fileTSB.join(""));
                _HardDriveManager.setBody(dirTSB[0], dirTSB[1], dirTSB[2], params[0]);
                // Update MBR
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File already exists."]));
            }
        }

        public readFile(params) {

        }

        public writeFile(params) {

        }

        public deleteFile(params) {

        }

        public format(params) {
            _HardDriveManager.filenameDict = {};
            _HardDriveManager.init();
        }

        public listFiles(params){

        }
    }
}
