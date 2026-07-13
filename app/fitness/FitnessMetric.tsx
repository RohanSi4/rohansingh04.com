import styles from "./fitness.module.css";

type FitnessMetricProps = {
  label: string;
  value: string;
  detail: string;
};

export function FitnessMetric({ label, value, detail }: FitnessMetricProps) {
  return (
    <div className={styles.metric}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}
