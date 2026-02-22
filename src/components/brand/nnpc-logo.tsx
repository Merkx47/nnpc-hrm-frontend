interface NNPCLogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function NNPCLogo({ className = '', showText = true, size = 40 }: NNPCLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/nnpc-logo.png"
        alt="NNPC"
        style={{ height: size, width: 'auto' }}
        className="object-contain"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide text-[var(--foreground)]">
            NNPC Retail
          </span>
          <span className="text-[10px] font-medium text-[var(--muted-foreground)] leading-none">
            Employee Management
          </span>
        </div>
      )}
    </div>
  );
}

export function NNPCIcon({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/nnpc-logo.png"
      alt="NNPC"
      style={{ height: size, width: 'auto' }}
      className="object-contain"
    />
  );
}
