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
            "list" : this.listFiles,
            "swap" : this.swapProcess
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

        public createFile(params): void {
            let filename: string = params[0];
            if (filename.indexOf("~") === -1){
                _HardDriveManager.createFile(filename);
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }
        }

        public readFile(params) {
            let filename: string= params[0];
            if (filename.indexOf("~") === -1){
                let fileText = _HardDriveManager.readFile(filename);
                if (fileText.length > 0){
                    _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, fileText.split("")));
                } else {
                    _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["File is empty."]));
                }
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }

        }

        public writeFile(params): void {
            // Get filename
            let filename: string = params[0];
            if (filename.indexOf("~") === -1){
                // Collect the file text
                let fileText = "";
                let i = 1;
                while (params[i] !== undefined){
                    fileText += params[i] + " ";
                    i++;
                }
                // Remove white space on both sides of quotes
                fileText = fileText.replace(/((\s)+^)|(\s+$)/, "");
                // Valid file text was entered
                if (fileText.charAt(0) === '"' && fileText.charAt(fileText.length-1) === '"') {
                    _HardDriveManager.writeFile(filename, fileText.slice(1,fileText.length-1));
                } else {
                    _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["Invalid Usage. Type 'help' for more details."]));
                }
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }

        }

        public deleteFile(params) {
            let fileName: string = params[0];
            if (fileName.indexOf("~") === -1){
                _HardDriveManager.deleteFile(fileName);
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }
        }

        public format(params) {
            let canFormat = true;
            if (canFormat){
                _HardDriveManager.filenameDict = {};
                _HardDriveManager.init();
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["Format could not be performed."]));
            }
        }

        public listFiles(params){
            let dir = _HardDriveManager.filenameDict;
            if (Object.keys(dir).length > 0){
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, ["Files: "]));
                for (let filename in _HardDriveManager.filenameDict){
                    if (filename.indexOf("~") === -1){
                        _KernelInterruptQueue.enqueue(new Interrupt(DISK_OUTPUT_IRQ, filename.split("")));
                    }
                }
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["Directory is empty."]));
            }
        }

        public swapProcess(params) {
            // Temp variables for current pcb info
            let currPCB: ProcessControlBlock = params[0];
            let currSegment: number = currPCB.getSegment();
            // Get the process code from the current process
            let currCode: string = _MMU.readSegment(currSegment);
            // Temp variables for pcb on disk
            let diskPCB: ProcessControlBlock = params[1];
            let diskSegment: number = diskPCB.getSegment();
            // Swap Segments (logical for MMU)
            diskPCB.updateSegment(currSegment);
            currPCB.updateSegment(diskSegment);
            _Scheduler.storeToCPU(diskPCB);
            _CPU.updateSegment(currSegment);

            // Swap the disk process out
            let diskFilename = _HardDriveManager.getFilename(diskPCB);
            let diskCode = _HardDriveManager.readFile(diskFilename);//.replace(/(0)+$/,"00"); // Remove unnecessary zeros
            let diskCodeArray: string[] = diskCode.match(/..?/g);
            _MMU.fillSegment(currSegment, diskCodeArray);
            _HardDriveManager.deleteFile(diskFilename);

            // Swap the current process in
            // Create and write to new swap file
            let currFilename = _HardDriveManager.getFilename(currPCB);
            _HardDriveManager.createFile(currFilename);
            _HardDriveManager.writeFile(currFilename, currCode);
        }
    }
}
