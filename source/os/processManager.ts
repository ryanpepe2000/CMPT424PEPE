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

        constructor(private processes: Array<ProcessControlBlock> = new Array<ProcessControlBlock>()) {
        }

        public createProcess(): ProcessControlBlock {
            let pcb: ProcessControlBlock = new ProcessControlBlock(this.getNextPID());
            this.processes[this.processes.length] = pcb;
            return pcb;
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
                    public pc: number = 0,
                    public acc: number = 0,
                    public xReg: number = 0,
                    public yReg: number = 0,
                    public zFlag: number = 0,
                    public state: string = "Waiting"){
        }
    }
}