import styles from './ChatBubble.module.css';

export default function ChatBubble({ role, text, isPartial = false }) {
  const isUser = role === 'user';
  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowBot}`}>
      {!isUser && (
        <span className={styles.avatar} aria-hidden="true">
          🧋
        </span>
      )}
      <div
        className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBot} ${isPartial ? styles.partial : ''}`}
      >
        {text}
      </div>
    </div>
  );
}
