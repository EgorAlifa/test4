export const DatasetPanelMixin = {
    watch: {
        dimensionsMetrics: {
            handler(dimensionsMetrics, oldDimensionsMetrics) {
                if (!dimensionsMetrics || dimensionsMetrics.length === 0) return;
                const newStr = JSON.stringify(dimensionsMetrics);
                const oldStr = oldDimensionsMetrics != null ? JSON.stringify(oldDimensionsMetrics) : null;
                if (oldStr != null && newStr === oldStr) return;

                const fieldNames = (dimensionsMetrics || []).map((f) => (typeof f === 'object' ? f?.name : f)).filter(Boolean);
                if (fieldNames.length === 0) return;

                const setIfEmpty = (prop, value) => {
                    if (this.props[prop] == null || this.props[prop] === '' && value) {
                        this.props[prop] = value;
                        this.propChanged(prop);
                    }
                };
                setIfEmpty('sourceIdField', fieldNames[0]);
                setIfEmpty('targetIdField', fieldNames[1] ?? fieldNames[0]);
                setIfEmpty('weightField', fieldNames[2] ?? null);
                setIfEmpty('sourceLabelField', fieldNames[0]);
                setIfEmpty('targetLabelField', fieldNames[1] ?? fieldNames[0]);
            },
            immediate: false
        },
        'props.sourceIdField'(newVal, oldVal) {
            if (newVal && newVal !== oldVal) this.propChanged('sourceIdField');
        },
        'props.targetIdField'(newVal, oldVal) {
            if (newVal && newVal !== oldVal) this.propChanged('targetIdField');
        }
    }
};
