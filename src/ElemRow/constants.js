const gradientFactory = ({ isEnabled = false, direction = 'to right', colorStops = [null, null] } = {}) => ({
    isEnabled,
    direction,
    colorStops
});

export const HoverStyleFactory = ({
    color = null,
    fontWeight = null,
    bgColor = null,
    gradient = {},
    transitionDuration = null
} = {}) => ({
    color,
    fontWeight,
    bgColor,
    gradient: gradientFactory(gradient),
    transitionDuration
});

export const SelectStyleFactory = ({
    color = null,
    fontWeight = null,
    bgColor = null,
    gradient = {},
    transitionDuration = null,
    border = { isDisplayed: false, borders: {}, borderRadius: {} }
} = {}) => ({
    color,
    fontWeight,
    bgColor,
    gradient: gradientFactory(gradient),
    transitionDuration,
    border
});
