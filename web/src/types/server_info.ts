export type ServerInfo = {
  os: { goos: string; numCpu: number; compiler: string; goVersion: string; numGoroutine: number };
  cpu: { cpus: number[]; cores: number };
  ram: { usedMB: number; totalMB: number; usedPercent: number };
  disk: { usedMB: number; usedGB: number; totalMB: number; totalGB: number; usedPercent: number };
};
