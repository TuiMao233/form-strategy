export default {
    validate(value, params) {
        return value.length <= params;
    },
    message: (params) => {
        return `{__field__}超出了${params}个长度限制`;
    },
    name: "该字段"
};
