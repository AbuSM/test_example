const { axios } = require("./fakeBackend/mock");

const getFeedbackByProductViewData = async (product, actualize = false) => {
    let result = {
        feedback: []
    };
    try {
        const {data} = await axios.get('/feedback', {params: {product: product}});
        let {feedback} = data;
        if (feedback.length) {
            feedback.sort((a, b) => a.date > b.date ? 1 : -1);
            if (actualize === true) {
                feedback = feedback.reverse().filter((feed, i) => {
                    return feedback.findIndex((data) =>
                        data.userId === feed.userId) === i;
                }).reverse()
            }
            result.feedback = await Promise.all(
                feedback
                    .map(async feed => {
                        const data = {};
                        const {userId = '', message = '', date} = feed;
                        const newDate = new Date(date);
                        data.user = await getUserCredentialsById(userId);
                        data.message = message;
                        data.date = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;
                        return data
                    }))
        } else {
            result = {
                message: "Отзывов пока нет"
            }
        }
    } catch (e) {
        console.error(e);
        result = {
            message: "Такого продукта не существует"
        };
    }
    return result;
};

const getUserCredentialsById = async (id) => {
    try {
        const {data} = await axios.get('/users', {params: {id}});
        const {users} = data;
        const [item] = users;
        const {name, email} = item || '';
        return `${name} (${email})`;
    } catch (e) {
        return ''
    }
};


module.exports = { getFeedbackByProductViewData };
