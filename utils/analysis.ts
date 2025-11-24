
import { AppState, CursorConfig } from '../types';
import { 
    DEFAULT_CURSOR_SPEED, MAX_CURSOR_SPEED, MIN_CURSOR_SPEED,
    DEFAULT_SNAP_STRENGTH, MAX_SNAP_STRENGTH
} from '../constants';

interface TuningResult {
    suggestion: string;
    changes: Partial<CursorConfig>;
}

export const analyzePerformance = (stats: AppState, currentConfig: CursorConfig): TuningResult => {
    const totalClicks = stats.clicks + stats.misses;
    const accuracy = totalClicks > 0 ? (stats.clicks / totalClicks) : 1;
    const avgTime = stats.avgTimeBetweenClicks; // ms

    // Scenario 1: High Miss Rate / Low Accuracy
    // Solution: Increase magnetic snap, reduce speed slightly to help control
    if (accuracy < 0.75) {
        return {
            suggestion: "We detected a lower accuracy rate. We've increased magnetic snap strength and slightly slowed the cursor to help you lock onto targets.",
            changes: {
                snapStrength: Math.min(currentConfig.snapStrength + 0.15, MAX_SNAP_STRENGTH),
                gravityRadius: Math.min(currentConfig.gravityRadius + 20, 160),
                cursorSpeed: Math.max(currentConfig.cursorSpeed - 0.1, MIN_CURSOR_SPEED)
            }
        };
    }

    // Scenario 2: High Precision but Slow Reaction (Latency)
    // Solution: Increase speed to reduce effort, moderate snap
    if (accuracy > 0.95 && avgTime > 1500) {
        return {
            suggestion: "Your precision is excellent, but movement time is high. We've increased the cursor speed to help you reach targets with less physical effort.",
            changes: {
                cursorSpeed: Math.min(currentConfig.cursorSpeed + 0.15, MAX_CURSOR_SPEED),
                snapStrength: Math.min(currentConfig.snapStrength + 0.05, MAX_SNAP_STRENGTH)
            }
        };
    }

    // Scenario 3: Fast but reckless (Medium accuracy, fast time)
    if (avgTime < 600 && accuracy < 0.90) {
        return {
            suggestion: "You're moving very fast! We've increased the snap radius to catch your cursor as it flies by targets.",
            changes: {
                gravityRadius: Math.min(currentConfig.gravityRadius + 30, 180),
                snapStrength: Math.min(currentConfig.snapStrength + 0.1, MAX_SNAP_STRENGTH)
            }
        };
    }

    // Scenario 4: Balanced / Good Performance
    if (accuracy > 0.90 && avgTime < 1200) {
         return {
            suggestion: "Your performance is solid! We've made minor tweaks to make the cursor feel snappier.",
            changes: {
                cursorSpeed: Math.min(currentConfig.cursorSpeed + 0.05, 0.7),
                snapStrength: Math.min(currentConfig.snapStrength + 0.05, 0.6)
            }
        };
    }

    // Default Fallback
    return {
        suggestion: "Resetting to balanced defaults for a fresh start.",
        changes: {
            cursorSpeed: DEFAULT_CURSOR_SPEED,
            snapStrength: DEFAULT_SNAP_STRENGTH
        }
    };
};
