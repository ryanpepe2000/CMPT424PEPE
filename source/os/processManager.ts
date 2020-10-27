/* ------------
     processManager.ts

     Contains definitions and initialization logic for processManager and ProcessControlBlock. The processManager
     is the overarching manager of processes, while the PCB is simply the ADT that stores relevant information
     about a process.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    export class ProcessManager {

        constructor(private processes: Array<ProcessControlBlock> = new Array<ProcessControlBlock>(),
                    private readyQueue: Queue = new Queue(),
                    private terminatedList: Array<ProcessControlBlock> = new Array<ProcessControlBlock>()) {
        }

        public getProcessList(): Array<ProcessControlBlock> {
            return this.processes;
        }

        public getReadyQueue(){
            return this.readyQueue;
        }

        public createProcess(segment: number): ProcessControlBlock {
            let pcb: ProcessControlBlock = new ProcessControlBlock(this.getNextPID(), segment);
            this.processes[this.processes.length] = pcb;
            return pcb;
        }

        public getRunning(): ProcessControlBlock{
            for (let pcb of this.getProcessList()){
                if (pcb.getState() === "Running"){
                    return pcb;
                }
            }
        }

        public getPCB(pid: number): ProcessControlBlock {
            return this.processes[pid];
        }

        private getNextPID(): number {
            let next = -1;
            for (let i = 0; i < this.processes.length; i++) {
                if (this.processes[i] != null && this.processes[i].pid > next) {
                    next = this.processes[i].pid;
                }
            }
            return next + 1;
        }
    }

    export class ProcessControlBlock {
        constructor(public pid: number,
                    public segment: number,
                    public pc: number = 0,
                    public acc: number = 0,
                    public xReg: number = 0,
                    public yReg: number = 0,
                    public zFlag: number = 0,
                    public state: string = "New"){
        }

        public getPID(): number {
            return this.pid;
        }

        public getPC(): number {
            return this.pc;
        }

        public setPC(num: number) {
            this.pc = num;
        }

        public addPC(amount: number){
            this.pc += amount;
            if (this.pc > MEMORY_LENGTH){
                this.pc = this.pc % MEMORY_LENGTH;
            }
        }

        public getAcc(): number {
            return this.acc;
        }

        public setAcc(num: number): void {
            this.acc = num;
        }

        public getXReg(): number {
            return this.xReg;
        }

        public setXReg(num: number) {
            this.xReg = num;
        }

        public getYReg(): number {
            return this.yReg;
        }

        public setYReg(num: number) {
            this.yReg = num;
        }

        public getZFlag(): number {
            return this.zFlag;
        }

        public setZFlag(num: number){
            this.zFlag = num;
        }

        public enableZFlag() {
            this.zFlag = 1;
        }

        public disableZFlag() {
            this.zFlag = 0;
        }

        public getState(): string {
            return this.state;
        }

        public setState(state: string): ProcessControlBlock {
            this.state = state;
            return this;
        }

        public getSegment(): number{
            return this.segment;
        }
    }
}