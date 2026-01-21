import { LayerType, PointTypes, RuleTypes, SectionType, TooltipViewType } from '../constants';

export const PointTypesOptions = [
    { label: 'Точка', value: PointTypes.POINT },
    { label: 'Маркер', value: PointTypes.MARKER }
];

export const RuleTypesOptions = [
    { label: 'Числовой', value: RuleTypes.NUMBER },
    { label: 'Текстовый', value: RuleTypes.STRING }
];

export const LayerTypesOptions = [
    { label: 'WMS', value: LayerType.WMS },
    { label: 'GeoJson', value: LayerType.GEO_JSON }
];

export const TextAlignOptions = [
    { label: 'Слева', value: 'left' },
    { label: 'По центру', value: 'center' },
    { label: 'Справа', value: 'right' }
];

export const SectionTypeOptions = [
    { label: 'Базовый слой', value: SectionType.BASE_LAYER },
    { label: 'Дополнительный слой', value: SectionType.ADDITIONAL_LAYER },
    { label: 'Точки/маркеры', value: SectionType.POINTS }
];

export const TooltipViewOptions = [
    { value: TooltipViewType.ALL, label: 'Всегда' },
    { value: TooltipViewType.CLICK, label: 'При нажатии' },
    { value: TooltipViewType.HOVER, label: 'При наведении' }
];

export const LayerControlPositionOptions = [
    { label: '⬉ Сверху слева', value: 'topleft' },
    { label: '⬈ Сверху справа', value: 'topright' },
    { label: '⬊ Снизу справа', value: 'bottomright' },
    { label: '⬋ Снизу слева', value: 'bottomleft' }
];

export const DirectionOptions = [
    { label: 'Слева', value: 'row' },
    { label: 'Справа', value: 'row-reverse' }
];

export const TooltipAlignOptions = [
    { value: 'right', label: 'Справа' },
    { value: 'left', label: 'Слева' },
    { value: 'top', label: 'Сверху' },
    { value: 'bottom', label: 'Снизу' },
    { value: 'center', label: 'По центру' },
    { value: 'auto', label: 'Авто по горизонтали' }
];

export const TilesOptions = [
    {
        label: '-',
        value: null
    },
    {
        label: 'URL слой',
        value: 'url'
    },
    {
        label: 'Стандартная',
        value: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    {
        label: 'cartocdn',
        value: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
    },
    {
        label: 'Темная',
        value: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    },
    {
        label: 'CycIOSM',
        value: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
    },
    {
        label: 'Гуманитарная',
        value: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    },
    // {
    //     label: 'Велосипедная карта',
    //     value: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey={apikey}'
    // },
    // {
    //     label: 'Карта транспорта',
    //     value: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey={apikey}'
    // },
    {
        label: 'OPNVKarte',
        value: 'https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png'
    },
    {
        label: 'JawgLight',
        value: 'https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=oGgmSiICFSzRjjrUzoH0mqVYpvFFI1z6HakEGoXpCzdUJxlIoIyrb52U8NRAaULx'
    }
    // {
    //     label: 'Streets ',
    //     value: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    // },
    // {
    //     label: 'Hybrid',
    //     value: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
    // },
    // {
    //     label: 'Satellite',
    //     value: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'
    // },
    // {
    //     label: 'Terrain',
    //     value: 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
    // }
];
