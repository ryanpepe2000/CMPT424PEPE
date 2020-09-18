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
        private static processes: Array<ProcessControlBlock>;
        constructor(private processes: Array<ProcessControlBlock> = new Array(0)) {
        }

        public static createProcess(): number{
            let PID = this.getMaxPID() + 1;
            this.processes[this.processes.length] = new ProcessControlBlock(PID);
            return PID;
        }

        public static getMaxPID(): number{
            let max = -1;
            for (let i = 0; i < this.processes.length; i++){
                if (this.processes[i] != null && this.processes[i].getPID() > max){
                    max = this.processes[i].getPID();
                }
            }
            return max;
        }
    }

    export class ProcessControlBlock {
        constructor(public PID: number,
                    public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public state: string = "Waiting"){
        }

        public getPID(): number{
            return this.PID;
        }
    }
}