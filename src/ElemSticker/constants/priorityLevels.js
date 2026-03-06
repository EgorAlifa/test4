/**
 * Priority Level Definitions
 *
 * Visual indicators for sticker importance levels.
 */

export const priorityLevels = {
    '': {
        name: '',
        label: 'Нет',
        icon: '',
        color: 'transparent',
        textColor: 'inherit'
    },
    low: {
        name: 'low',
        label: 'Низкий',
        icon: 'mdi-circle',
        color: '#4CAF50',
        textColor: '#2E7D32'
    },
    medium: {
        name: 'medium',
        label: 'Средний',
        icon: 'mdi-circle',
        color: '#FFC107',
        textColor: '#F57F17'
    },
    high: {
        name: 'high',
        label: 'Высокий',
        icon: 'mdi-circle',
        color: '#FF5722',
        textColor: '#D84315'
    },
    urgent: {
        name: 'urgent',
        label: 'Срочный',
        icon: 'mdi-alert-circle',
        color: '#F44336',
        textColor: '#C62828'
    }
};

/**
 * Get priority config by level
 * @param {string} level - Priority level
 * @returns {object} Priority configuration
 */
export function getPriorityConfig(level) {
    return priorityLevels[level] || priorityLevels[''];
}

/**
 * Priority options for dropdown selectors
 */
export const priorityOptions = Object.entries(priorityLevels).map(([key, config]) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    color: config.color
}));

export default priorityLevels;
