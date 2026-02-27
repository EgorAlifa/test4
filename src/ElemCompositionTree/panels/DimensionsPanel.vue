<template>
    <w-panel>
        <ui-container>

            <!-- ── Header card ──────────────────────────────────────────── -->
            <div class="dim-card" :class="selectedCount > 0 ? 'dim-card--active' : ''">
                <div class="dim-card__ico">
                    <i class="mdi mdi-sitemap" />
                </div>
                <div class="dim-card__body">
                    <div class="dim-card__title">Объяснить по</div>
                    <div
                        class="dim-card__sub"
                        :class="selectedCount > 0 ? 'dim-card__sub--set' : 'dim-card__sub--empty'"
                    >
                        <template v-if="selectedCount > 0">
                            <i class="mdi mdi-check-circle-outline" />
                            {{ selectedCount }} {{ ruPlural(selectedCount, 'измерение', 'измерения', 'измерений') }} выбрано
                        </template>
                        <template v-else>
                            <i class="mdi mdi-alert-circle-outline" />
                            Не выбрано
                        </template>
                    </div>
                </div>
                <div v-if="selectedCount > 0" class="dim-card__badge">{{ selectedCount }}</div>
            </div>

            <!-- ── Multi-select ──────────────────────────────────────────── -->
            <div class="field-label">Измерения для детализации</div>
            <ui-select
                v-model="props.explainByDimensionNames"
                :options="dimensionsOptions"
                multiple
                @change="propChanged('explainByDimensionNames')"
            >
                Измерения
            </ui-select>

            <!-- ── Selected order preview ────────────────────────────────── -->
            <div v-if="selectedCount > 0" class="dim-order">
                <div class="dim-order__label">
                    <i class="mdi mdi-sort-numeric-ascending" />
                    Порядок при нажатии «+»
                </div>
                <div class="dim-pills">
                    <div
                        v-for="(name, i) in props.explainByDimensionNames"
                        :key="name"
                        class="dim-pill"
                    >
                        <span class="dim-pill__num">{{ i + 1 }}</span>
                        <span class="dim-pill__name">{{ name }}</span>
                    </div>
                </div>
            </div>

            <!-- ── Hint ──────────────────────────────────────────────────── -->
            <div class="info-box">
                <i class="mdi mdi-information-outline info-box__icon" />
                <span>Выберите измерения, по которым можно раскрывать дерево. Порядок определяет список при нажатии «+».</span>
            </div>

        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Измерения', icon: 'altimeter' },

    data() {
        return {
            ...PanelDatasetMixinTypes
        };
    },

    computed: {
        dimensionsOptions() {
            return this.buildOptions(this.dimensions || [], { empty: false });
        },
        selectedCount() {
            return Array.isArray(this.props.explainByDimensionNames)
                ? this.props.explainByDimensionNames.filter(Boolean).length
                : 0;
        }
    },

    methods: {
        ruPlural(n, one, few, many) {
            const m10 = n % 10;
            const m100 = n % 100;
            if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
            if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} ${few}`;
            return `${n} ${many}`;
        }
    }
};
</script>

<style scoped>
/* ── Dimension header card ─────────────────────────────────────── */
.dim-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    margin-bottom: 14px;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.dim-card--active {
    border-color: #a5b4fc;
    background: linear-gradient(135deg, #f5f7ff, #eff2ff);
    box-shadow: 0 2px 8px rgba(79, 106, 255, 0.1);
}

.dim-card__ico {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #e2e8f0;
    color: #64748b;
    font-size: 20px;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
}
.dim-card--active .dim-card__ico {
    background: #dbeafe;
    color: #4f6aff;
}

.dim-card__body { flex: 1; min-width: 0; }
.dim-card__title {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.3;
}
.dim-card__sub {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    margin-top: 2px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.dim-card__sub--set   { color: #4f6aff; }
.dim-card__sub--empty { color: #94a3b8; font-style: italic; }
.dim-card__sub .mdi   { font-size: 13px; flex-shrink: 0; }

.dim-card__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 26px;
    border-radius: 13px;
    background: #4f6aff;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}

/* ── Field label ───────────────────────────────────────────────── */
.field-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
}

/* ── Dimension order preview ───────────────────────────────────── */
.dim-order {
    margin-top: 10px;
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
}
.dim-order__label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 7px;
}
.dim-order__label .mdi { font-size: 13px; }

.dim-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}
.dim-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px 3px 4px;
    background: #eff2ff;
    border: 1px solid #a5b4fc;
    border-radius: 20px;
    max-width: 100%;
}
.dim-pill__num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4f6aff;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
}
.dim-pill__name {
    font-size: 11px;
    font-weight: 500;
    color: #3730a3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
}

/* ── Info box ──────────────────────────────────────────────────── */
.info-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 9px 11px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    font-size: 11px;
    color: #1e40af;
    line-height: 1.5;
    margin-top: 10px;
}
.info-box__icon {
    font-size: 14px;
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 1px;
}
</style>
