<template>
    <table class="table table-borders w-100">
        <tbody>
            <tr v-for="i of rowsCount || 3" :key="i">
                <td v-for="j of columnsCount || 3" :key="j">
                    <div class="skeleton"></div>
                </td>
            </tr>
        </tbody>
    </table>
</template>
<script>
export default {
    props: {
        rowsCount: {
            type: Number
        },
        columnsCount: {
            type: Number
        }
    }
};
</script>
