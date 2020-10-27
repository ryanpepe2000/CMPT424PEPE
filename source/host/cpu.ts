/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public segment: number = 0,
                    public isExecuting: boolean = false,
                    public instructionList: Array<Instruction> = new Array<Instruction>(11)) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.segment = 0;
            this.isExecuting = false;
            // Populate Instruction Array with IR, mneumontic, pcincrements, and the static Instruction function
            this.instructionList[0] =  (new Instruction("A9", "LDA", 2, Instruction.loadAccConstant));
            this.instructionList[1] =  (new Instruction("AD", "LDA", 3, Instruction.loadAccMemory));
            this.instructionList[2] =  (new Instruction("8D", "STA", 3, Instruction.storeAcc));
            this.instructionList[3] =  (new Instruction("6D", "ADC", 3, Instruction.addWithCarry));
            this.instructionList[4] =  (new Instruction("A2", "LDX", 2, Instruction.loadXConstant));
            this.instructionList[5] =  (new Instruction("AE", "LDX", 3, Instruction.loadXMemory));
            this.instructionList[6] =  (new Instruction("A0", "LDY", 2, Instruction.loadYConstant));
            this.instructionList[7] =  (new Instruction("AC", "LDY", 3, Instruction.loadYMemory));
            this.instructionList[8] =  (new Instruction("EA", "NOP", 1, Instruction.noOperation));
            this.instructionList[9] =  (new Instruction("00", "BRK", 1, Instruction.break));
            this.instructionList[10] = (new Instruction("EC", "CPX", 3, Instruction.compareXReg));
            this.instructionList[11] = (new Instruction("D0", "BNE", 2, Instruction.branchBytes));
            this.instructionList[12] = (new Instruction("EE", "INC", 3, Instruction.incrementValue));
            this.instructionList[13] = (new Instruction("FF", "SYS", 1, Instruction.systemCall));
        }

        public clearCPU(){
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.segment = 0;
        }

        // Executes once per cpu clock pulse if there are user processes in execution
        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            _Scheduler.executeRoundRobin();
             // Handles single step logic
            if (_SingleStep) {
                this.isExecuting = false;
            }
            Control.highlightMemoryDisplay();
        }

        public execute(): void {
            for (let pcb of _ProcessManager.getProcessList()) {
                if (pcb.state === "Running") {
                    let instruction = this.getInstruction(_MemoryAccessor.readByte(Utils.decToHex(_MMU.translateAddress(this.PC, _CPU.segment))));
                    let pcInc = instruction.getPCInc();
                    // Need to pass proper physical addresses using logical address and segments
                    instruction.getCallback()([
                        _MemoryAccessor.readByte(Utils.decToHex(_MMU.translateAddress(this.PC + 1, _CPU.segment))),  // Next item in memory
                        _MemoryAccessor.readByte(Utils.decToHex(_MMU.translateAddress(this.PC + 2, _CPU.segment)))   // The following item in memory
                    ]);
                    if (instruction.getMneumonic() === "BRK") {
                        pcb.setState("Terminated")
                    }
                    _CPU.addPc(pcInc);
                    this.updatePCB(pcb);
                }
                pcb.incrementTime();
            }
        }

        // Gets the instruction from a provided OP code
        public getInstruction(opCode: string): Instruction {
            for (let i = 0; i < this.instructionList.length; i++){
                if (this.instructionList[i].getOpCode() === opCode){
                    return this.instructionList[i];
                }
            }
        }

        // Begins execution of a process. To be called by shellRun
        public startProcess(pcb: ProcessControlBlock) {
            _Scheduler.runProcess(pcb);
            if (!_SingleStep){
                this.isExecuting = true;
            }
        }

        public endProcess(pcb: ProcessControlBlock) {
            _Scheduler.killProcess(pcb);
        }

        public endAllProcesses(){
            _Scheduler.killAll();
        }

        // Updates the PCB to match the current CPU's status
        updatePCB(pcb: ProcessControlBlock){
            pcb.setPC(this.PC);
            pcb.setAcc(this.Acc);
            pcb.setXReg(this.Xreg);
            pcb.setYReg(this.Yreg);
            pcb.setZFlag(this.Zflag);
        }

        // Getters and setters for all CPU attributes
        public getPC(): number{
            return this.PC;
        }

        public addPc(amount: number){
            this.PC += amount;
            if (this.PC > MEMORY_LENGTH){    // If the PC overflows, it should become remainder
                this.PC = this.PC % MEMORY_LENGTH;
            }
        }

        public getAcc(): number {
            return this.Acc;
        }

        public setAcc(num: number): void {
            this.Acc = num;
        }

        public getXReg(): number {
            return this.Xreg;
        }

        public setXReg(num: number) {
            this.Xreg = num;
        }

        public getYReg(): number {
            return this.Yreg;
        }

        public setYReg(num: number) {
            this.Yreg = num;
        }

        public getZFlag(): number {
            return this.Zflag;
        }

        public enableZFlag() {
            this.Zflag = 1;
        }

        public disableZFlag() {
            this.Zflag = 0;
        }
    }

    // Class to contain all attributes and static execution commands for Processes
    export class Instruction {
        constructor(private opCode: string,
                    private mneumonic: string,
                    private pcIncrement: number,
                    private callback:(params?: string[]) => any){
        }

        // Getters and setters
        getOpCode(): string{
            return this.opCode;
        }

        getMneumonic(): string {
            return this.mneumonic;
        }

        getPCInc(): number {
            return this.pcIncrement;
        }

        getCallback(): any {
            return this.callback;
        }

        // Static methods used for OP Codes instructions
        public static loadAccConstant(params: string[]){
            _CPU.setAcc(Utils.hexToDec(params[0]));
        }

        public static loadAccMemory(params: string[]){
            let address = params[1] + params[0];
            address = Utils.decToHex(_MMU.translateAddress(Utils.hexToDec(address), _CPU.segment));
            _CPU.setAcc(Utils.hexToDec(_MemoryAccessor.readByte(address)));
        }

        public static storeAcc(params: string[]){
            let address = params[1] + params[0];
            let pos = _MMU.translateAddress(Utils.hexToDec(address), _CPU.segment);
            let val = Utils.decToHex(_CPU.getAcc());
            if (val === "0") val = "00"; // Ensures the value being stored is in proper format
            _MemoryAccessor.writeByte(pos, val);
        }

        public static addWithCarry(params: string[]){
            let address = params[1] + params[0];
            address = Utils.decToHex(_MMU.translateAddress(Utils.hexToDec(address), _CPU.segment));
            let sum = _CPU.getAcc() + Utils.hexToDec(_MemoryAccessor.readByte(address));
            if (sum >= 256 || sum < 0){
                _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_ERROR_IRQ, ["An error has occurred while adding two operands."]));
            }
            _CPU.setAcc(sum)
        }

        public static loadXConstant(params: string[]){
            _CPU.setXReg(Utils.hexToDec(params[0]));
        }

        public static loadXMemory(params: string[]){
            let address = params[1] + params[0];
            address = Utils.decToHex(_MMU.translateAddress(Utils.hexToDec(address), _CPU.segment));
            _CPU.setXReg(Utils.hexToDec(_MemoryAccessor.readByte(address)));
        }

        public static loadYConstant(params: string[]){
            _CPU.setYReg(Utils.hexToDec(params[0]));
        }

        public static loadYMemory(params: string[]){
            let address = params[1] + params[0];
            address = Utils.decToHex(_MMU.translateAddress(Utils.hexToDec(address), _CPU.segment));
            _CPU.setYReg(Utils.hexToDec(_MemoryAccessor.readByte(address)));
        }

        public static noOperation(): void{
            return; // Does nothing
        }

        // This is a system call to ensure that all
        // break logic is executed by Kernel (God)
        public static break(): void {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(BREAK_PROCESS_IRQ, ["Program execution finished.", _ProcessManager.getRunning().pid]));
        }

        public static compareXReg(params: string[]){
            let address = params[1] + params[0];
            address = Utils.decToHex(_MMU.translateAddress(Utils.hexToDec(address), _CPU.segment));
            Utils.hexToDec(_MemoryAccessor.readByte(address)) === _CPU.getXReg() ?
                _CPU.enableZFlag() : _CPU.disableZFlag();
        }

        public static branchBytes(params: string[]) {
            if (_CPU.getZFlag() === 0) { // Only branches if z flag is not set
                let numBytes = Utils.hexToDec(params[0]);
                _CPU.addPc(numBytes); // Modulo operator in addPC will deal with overflow
            }
        }

        public static incrementValue(params: string[]) {
            let address = params[1] + params[0];
            let pos = _MMU.translateAddress(Utils.hexToDec(address), _CPU.segment);
            address = Utils.decToHex(_MMU.translateAddress(Utils.hexToDec(address), _CPU.segment));
            if (_MemoryAccessor.readByte(address).toUpperCase() === "FF") {
                _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_ERROR_IRQ, ["An error has occurred while incrementing a value."]));
            }
            _MemoryAccessor.writeByte(pos, Utils.decToHex(Utils.hexToDec(_MemoryAccessor.readByte(address)) + 0x1));
        }

        public static systemCall() {
            let retVal = "";
            if (_CPU.getXReg() === 1) {
                retVal += _CPU.getYReg();
            } else if (_CPU.getXReg() === 2) {
                let index = _CPU.getYReg();
                let val = _MemoryAccessor.readByte(Utils.decToHex(_MMU.translateAddress(index, _CPU.segment)));
                while(val !== "0" && val !== "00"){ // Format checks
                    retVal += String.fromCharCode(Utils.hexToDec(val));
                    val = _MemoryAccessor.readByte(Utils.decToHex(_MMU.translateAddress(++index, _CPU.segment)));
                }
            } else {   // Only sends a system call if absolutely necessary
                return;
            }
            _KernelInterruptQueue.enqueue(new Interrupt(PRINT_PROCESS_IRQ, [retVal]));
        }
    }
}
