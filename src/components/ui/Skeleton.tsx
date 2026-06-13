// src/components/ui/Skeleton.tsx

interface SkeletonProps {
  width?:        string | number;
  height?:       string | number;
  borderRadius?: string;
  style?:        React.CSSProperties;
}

export function Skeleton({ width = "100%", height = "16px", borderRadius = "6px", style }: SkeletonProps) {
  return (
    <div style={{
      width, height,
      borderRadius,
      background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.875rem", marginBottom: "1rem" }}>
        <Skeleton width="40px" height="40px" borderRadius="10px" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Skeleton height="14px" width="60%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton height="32px" width="40%" style={{ marginBottom: "0.5rem" }} />
      <Skeleton height="12px" width="70%" />
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="glass-card-static" style={{ padding: "1.125rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center" }}>
      <Skeleton width="20px" height="20px" borderRadius="50%" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Skeleton height="14px" width="55%" />
        <Skeleton height="12px" width="35%" />
      </div>
      <Skeleton width="60px" height="22px" borderRadius="999px" />
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "1rem" }} />
      <div style={{ display: "flex", gap: "0.875rem", marginBottom: "1.25rem" }}>
        <Skeleton width="42px" height="42px" borderRadius="10px" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Skeleton height="14px" width="70%" />
          <Skeleton height="12px" width="45%" />
        </div>
      </div>
      <Skeleton height="1px" width="100%" style={{ marginBottom: "0.875rem", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton height="12px" width="40%" />
        <Skeleton width="16px" height="16px" borderRadius="4px" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Greeting skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Skeleton height="28px" width="40%" />
        <Skeleton height="16px" width="55%" />
      </div>
      {/* Cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
        {[0,1,2,3].map((i) => <CardSkeleton key={i} />)}
      </div>
      {/* Tasks skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {[0,1].map((i) => (
          <div key={i} className="glass-card-static" style={{ padding: "1.5rem" }}>
            <Skeleton height="16px" width="40%" style={{ marginBottom: "1rem" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[0,1,2].map((j) => <TaskSkeleton key={j} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}