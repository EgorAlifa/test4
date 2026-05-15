<!-- 
EXACT COPY of map2's animation logic
This component manages activeParticles using YOUR algorithm
-->
<script>
// eslint-disable-next-line import/named
import {
    ANIMATION_SPEED_MS,
    FADE_DURATION_DAYS,
    PREDEFINED_COLORS,
    PARTICLE_IMAGE_SRC,
    INITIAL_OPACITY,
    INITIAL_FLASH,
    PARTICLE_BASE_SIZE,
    FLASH_FADE_SPEED_MULTIPLIER
} from '../utils/constants';

export default {
    name: 'AnimationLayer',
    
    props: {
        data: {
            type: Array,
            default: () => []
        },
        isPlaying: {
            type: Boolean,
            default: false
        },
        speed: {
            type: Number,
            default: ANIMATION_SPEED_MS
        },
        fadeTime: {
            type: Number,
            default: FADE_DURATION_DAYS
        },
        categoryColorMap: {
            type: Object,
            default: () => ({})
        },
        predefinedColors: {
            type: Array,
            default: () => PREDEFINED_COLORS || []
        },
        customColors: {
            type: Object,
            default: () => ({})
        }
    },
    
    data() {
        return {
            activeParticles: [],
            currentAnimationDate: null,
            animationInterval: null,
            baseParticleImage: null,
            tintedParticleImageCache: {},
            eventsByDate: {}
        };
    },
    
    watch: {
        data: {
            handler() {
                this.prepareAnimationData();
            },
            deep: true
        },
        
        isPlaying(newVal, oldVal) {
            if (newVal === true) {
                // Restart if needed
                if (this.currentAnimationDate == null && this.data.length > 0) {
                    this.prepareAnimationData();
                }
                this.startAnimation();
            } else {
                this.stopAnimation();
                // DON'T clear particles when stopping - let them stay visible!
            }
        }
    },
    
    mounted() {
        // Load base particle image (EXACT from map2)
        this.baseParticleImage = new Image();
        this.baseParticleImage.src = PARTICLE_IMAGE_SRC;
        
        this.prepareAnimationData();
    },
    
    beforeDestroy() {
        this.stopAnimation();
    },
    
    methods: {
        /**
         * Prepare animation data (EXACT from map2)
         */
        prepareAnimationData() {
            this.activeParticles = [];
            this.currentAnimationDate = null;
            
            if (this.data == null || this.data.length === 0) {
                this.$emit('particles-updated', []);
                return;
            }
            
            // Find first date and start ONE DAY BEFORE (since loop advances first)
            const minDate = new Date(Math.min(...this.data.map(dataItem => new Date(dataItem.date_event).getTime())));
            
            this.currentAnimationDate = new Date(minDate);
            this.currentAnimationDate.setHours(0, 0, 0, 0);
            // Start one day before so first advance lands on first data day
            this.currentAnimationDate.setDate(this.currentAnimationDate.getDate() - 1);
            
            // Pre-group events by date (EXACT from map2)
            const newEventsByDate = {};
            for (const event of this.data) {
                const eventDate = new Date(event.date_event);
                const dateStr = eventDate.toISOString().split('T')[0];
                if (newEventsByDate[dateStr] == null) {
                    newEventsByDate[dateStr] = [];
                }
                newEventsByDate[dateStr].push(event);
            }
            this.eventsByDate = newEventsByDate;
        },
        
        /**
         * Start animation loop (EXACT from map2)
         */
        startAnimation() {
            if (this.animationInterval != null) {
                return;
            }
            
            // Use constant if prop not provided
            const actualSpeed = this.speed != null ? this.speed : ANIMATION_SPEED_MS;
            
            this.animationInterval = setInterval(() => {
                this.advanceAnimation();
            }, actualSpeed);
        },
        
        /**
         * Stop animation
         */
        stopAnimation() {
            if (this.animationInterval) {
                clearInterval(this.animationInterval);
                this.animationInterval = null;
            }
        },
        
        /**
         * Reset animation (called by parent when Reset button clicked)
         * Unused but kept for potential future use
         */
        // eslint-disable-next-line no-unused-vars
        reset() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.reset();
            }
            this.stopAnimation();
            this.activeParticles = [];
            this.currentAnimationDate = null;
            this.eventsByDate = {};
            this.$emit('particles-updated', []);
            // Re-prepare data for next animation
            this.prepareAnimationData();
        },
        
        /**
         * Advance animation by one step (EXACT from map2/useAnimationLogic.js)
         */
        advanceAnimation() {
            if (this.currentAnimationDate == null) {
                return;
            }
            
            // EXACT from map2 line 47-48: Advance date FIRST
            this.currentAnimationDate.setDate(this.currentAnimationDate.getDate() + 1);
            this.currentAnimationDate = new Date(this.currentAnimationDate);
            
            // EXACT from map2 line 50: Get events for NEW date
            const currentDateString = this.currentAnimationDate.toISOString().split('T')[0];
            const dailyEvents = this.eventsByDate[currentDateString] || [];
            
            // EXACT from map2 line 63-74: Add particles if events exist
            if (dailyEvents.length > 0) {
                dailyEvents.forEach(dataPoint => {
                    this.addDataPointToMap(dataPoint, this.currentAnimationDate);
                });
            }
            
            // EXACT from map2 line 80: Update existing particles
            this.updateParticlesAndRedraw();
            
            // CRITICAL: Create NEW array reference to trigger Vue reactivity
            // Without this, Vue won't detect the change because we're mutating the same array
            const copiedActiveParticles = [...this.activeParticles];
            
            // Emit updated particles with NEW reference
            this.$emit('particles-updated', copiedActiveParticles);
            
            // Emit animation progress with current date
            this.$emit('animation-progress', {
                date: this.currentAnimationDate,
                totalParticles: this.activeParticles.length
            });
            
            // Check if we've reached the last data day
            const maxDate = new Date(Math.max(...this.data.map(dataItem => new Date(dataItem.date_event).getTime())));
            maxDate.setHours(0, 0, 0, 0);
            
            // DISABLED: Automatic page loading during animation
            // TODO: Re-enable when pagination logic is refined
            // this.$emit('check-load-more', {
            //     currentDate: this.currentAnimationDate,
            //     maxDataDate: maxDate
            // });
            
            // Stop when we reach the last data day (all data is now visible)
            if (this.currentAnimationDate >= maxDate) {
                this.stopAnimation();
                // Reset date to allow restart
                this.currentAnimationDate = null;
                // Emit particles one last time so they persist on map
                this.$emit('particles-updated', this.activeParticles);
                this.$emit('animation-complete');
            }
        },
        
        /**
         * Add data point as particle (EXACT from map2)
         */
        addDataPointToMap(dataPoint, animationDate) {
            const color = this.getCategoryColor(dataPoint.category_event);
            const tintedImageObject = this.colorizeAndCacheParticleImage(color);
            const randomSuffixLength = 9; // eslint-disable-line no-magic-numbers
            const randomBase = 36; // eslint-disable-line no-magic-numbers
            const randomStartIndex = 2; // eslint-disable-line no-magic-numbers
            const particleId = `${dataPoint.id_event || new Date(dataPoint.date_event).getTime()}-${Math.random().toString(randomBase).substr(randomStartIndex, randomSuffixLength)}`;
            
            const particle = {
                id: particleId,
                latitude: dataPoint.latitude,
                longitude: dataPoint.longitude,
                category: dataPoint.category_event,
                date: new Date(dataPoint.date_event),
                animationDate: new Date(animationDate),
                opacity: INITIAL_OPACITY,
                flash: INITIAL_FLASH,
                size: PARTICLE_BASE_SIZE,
                tintedImageObject,
                color,
                isSelected: false
            };
            
            this.activeParticles.push(particle);
        },
        
        /**
         * Update particles - fade them during animation, freeze at completion
         */
        updateParticlesAndRedraw() {
            if (this.currentAnimationDate == null) {
                return;
            }
            
            const now = this.currentAnimationDate.getTime();
            // Use constant if prop not provided
            const fadeDuration = this.fadeTime != null ? this.fadeTime : FADE_DURATION_DAYS;
            const millisecondsPerDay = 24 * 60 * 60 * 1000; // eslint-disable-line no-magic-numbers
            const minimumOpacityPercent = 10; // eslint-disable-line no-magic-numbers
            
            // Update all particles WITHOUT removing them
            this.activeParticles.forEach(particle => {
                const ageInMs = now - particle.animationDate.getTime();
                const ageInDays = ageInMs / millisecondsPerDay;
                
                // Calculate fade progress (capped at 100%)
                const progress = Math.min(1, ageInDays / fadeDuration);
                
                // Update opacity and flash (minimum 10% to keep particles visible)
                particle.opacity = Math.max(minimumOpacityPercent, INITIAL_OPACITY * (1 - progress));
                particle.flash = Math.max(minimumOpacityPercent, INITIAL_FLASH * (1 - Math.min(1, progress * FLASH_FADE_SPEED_MULTIPLIER)));
            });
        },
        
        /**
         * Get category color (helper method)
         */
        getCategoryColor(category) {
            const upperCategory = category ? category.toUpperCase() : '';
            
            // Check if there's a custom color override
            if (this.customColors && this.customColors[upperCategory]) {
                return this.customColors[upperCategory];
            }
            
            // Check categoryColorMap with uppercase key (matches legend logic)
            if (this.categoryColorMap[upperCategory]) {
                return this.categoryColorMap[upperCategory];
            }
            
            // Fallback: check original case for backward compatibility
            if (this.categoryColorMap[category]) {
                return this.categoryColorMap[category];
            }
            
            // Final fallback: use hash-based color from predefined palette
            const colors = this.predefinedColors;
            const index = Math.abs(this.hashCode(category)) % colors.length;
            return colors[index];
        },
        
        /**
         * Simple hash function for consistent color assignment
         */
        hashCode(str) {
            let hash = 0;
            const bitShiftAmount = 5; // eslint-disable-line no-magic-numbers
            for (let i = 0; i < str.length; i++) {
                // eslint-disable-next-line no-bitwise
                hash = str.charCodeAt(i) + ((hash << bitShiftAmount) - hash);
            }
            return hash;
        },
        
        /**
         * Colorize particle image (EXACT from map2 imageUtils)
         */
        colorizeAndCacheParticleImage(hexColor) {
            if (this.baseParticleImage == null || this.baseParticleImage.complete !== true) {
                return null;
            }
            
            const cacheKey = hexColor;
            if (this.tintedParticleImageCache[cacheKey] != null) {
                return this.tintedParticleImageCache[cacheKey];
            }
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.baseParticleImage.width;
            tempCanvas.height = this.baseParticleImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx == null) {
                return null;
            }
            
            const redStartIndex = 1; // eslint-disable-line no-magic-numbers
            const redEndIndex = 3; // eslint-disable-line no-magic-numbers
            const greenStartIndex = 3; // eslint-disable-line no-magic-numbers
            const greenEndIndex = 5; // eslint-disable-line no-magic-numbers
            const blueStartIndex = 5; // eslint-disable-line no-magic-numbers
            const blueEndIndex = 7; // eslint-disable-line no-magic-numbers
            const hexBase = 16; // eslint-disable-line no-magic-numbers
            const redValue = parseInt(hexColor.slice(redStartIndex, redEndIndex), hexBase);
            const greenValue = parseInt(hexColor.slice(greenStartIndex, greenEndIndex), hexBase);
            const blueValue = parseInt(hexColor.slice(blueStartIndex, blueEndIndex), hexBase);
            
            // Draw the base image
            tempCtx.drawImage(this.baseParticleImage, 0, 0);
            // Apply color tint
            tempCtx.globalCompositeOperation = 'multiply';
            tempCtx.fillStyle = `rgb(${redValue},${greenValue},${blueValue})`;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            // Restore an alpha channel from the original image
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(this.baseParticleImage, 0, 0);
            // Reset composite operation
            tempCtx.globalCompositeOperation = 'source-over';
            
            const tintedDataURL = tempCanvas.toDataURL();
            const tintedImage = new Image();
            tintedImage.src = tintedDataURL;
            this.tintedParticleImageCache[cacheKey] = tintedImage;
            return tintedImage;
        }
    },
    
    render() {
        return null; // No template needed
    }
};
</script>

