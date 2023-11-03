<template>
</template>

<script>
    import TenantAware from "../../labs/TenantAware";
    import StorageBaseComposition from "./StorageBaseComposition";

    export default {
        name: 'storage-base',
        mixins: [StorageBaseComposition],
    }

</script>


<style>
    .basic-bg {
        background: #F5F5F5;
    }

    .basic-close {
        background: red;
        color: #E53935;
    }

    .basic-center {
        position: absolute;
        top: 50%;
        right: 50%;
    }

    .basic-title-sm {
        font-size: 22px;
    }

    .basic-title {
        font-size: 25px;
    }

    .basic-title-lg {
        font-size: 28px;
    }

    .basic-title-content {
        font-size: 12px;
    }

    .basic-sub-title-sm {
        font-size: 11px;
    }

    .basic-sub-title {
        font-size: 14px;
    }

    .basic-sub-title-lg {
        font-size: 17px;
    }

    .basic-sub-title-content-sm {
        font-size: 10px;
    }

    .basic-sub-title-content {
        font-size: 12px;
    }

    .basic-sub-title-content-lg {
        font-size: 14px;
    }

    .info-sub-bg {
        background-color: #BDBDBD;
        color: white;
        border-radius: 20px;
        width: 255px;
        height: 155px;
        margin-top: 20px;
        padding: 5px;
    }

    .info-description {
        text-align: left;
        margin-left: 20px;
        margin-top: 10px;
    }


</style>