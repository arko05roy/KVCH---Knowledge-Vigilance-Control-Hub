export interface OsLayerTelemetry {
  platform: string;
  release: string;
  arch: string;
  hostname: string;
  bootTime: number;
  hardwareUuid: string;
  cpuModel: string;
  cpuCores: number;
}

export interface NetworkLayerTelemetry {
  primaryInterface: string;
  localIp: string;
  macHash: string;
  subnetMask: string;
  isInternal: boolean;
}

export interface TransportLayerTelemetry {
  activeSocketsHash: string;
  listeningPorts: number[];
  socketCount: number;
}

export interface PresentationLayerTelemetry {
  sslVersion: string;
  cryptoCurvesHash: string;
  environmentLang: string;
  nodeVersion: string;
}

export interface MemoryLayerTelemetry {
  totalMemoryBytes: number;
  pageSize: number;
  heapTotalBytes: number;
  memorySignature: string;
}

export interface FiveLayerTelemetry {
  layer1_os: OsLayerTelemetry;
  layer2_network: NetworkLayerTelemetry;
  layer3_transport: TransportLayerTelemetry;
  layer4_presentation: PresentationLayerTelemetry;
  layer5_memory: MemoryLayerTelemetry;
  probedAt: string;
}

export interface FingerprintEnvelope {
  fingerprint: string;
  prefix: string;
  timestamp: number;
  layersHash: string;
  signature: string;
  telemetry: FiveLayerTelemetry;
  isValid: boolean;
}
