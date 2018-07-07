/* Shows a modal dialog asking for a text response from the user. */

const Vue = require('vue');
const locale = require('../../locale');
const eventHub = require('../../common/eventHub');
const { thenable } = require('../../vue/mixins/thenable');

require('./index.less');

const prompter = {
	component: Vue.extend({
		template: require('./index.html'),

		data: () => ({
			message: '',
			response: '',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			buttonClass: 'primary',
			modalClass: '',
			isValid: true,
			validationError: '',
			validator: function() {},

			origin: null
		}),

		mounted() {
			this.$nextTick(function () {
				// code that assumes this.$el is in-document
				this.$refs.response.focus();
				this.$refs.response.select();
			});
		},

		methods: {
			accept() {
				const validResponse = this.validator(this.response);

				if (typeof validResponse === 'string') {
					this.isValid = false;
					this.validationError = validResponse;
				}
				else {
					this.isValid = true;
					eventHub.$emit('close', this.response);
				}
			},

			cancel() {
				console.log("prompt: cancel-method");
				eventHub.$emit('close');
			}
		},

		components: {
			'modal-dialog': require('../../ui/modal-dialog')
		},

		mixins: [thenable]
	}),

	/**
	 Creates a prompt modal dialog using the given data, and returns its
	 promise, which rejects if the 'cancel' button was selected.
	*/

	prompt(data) {
		return new prompter.component({ data }).$mountTo(document.body).then(
			result => {
				/*
				False results are produced by the close button and the cancel
				button. If the result is false, convert it into a rejection.

				Note: this may change in the future, as using rejections for
				negative results is somewhat unidiomatic.
				*/

				console.log("prompt: result", result);
				if (!result) {
					throw result;
				}

				return result;
			}
		).catch(err => {
			console.log("prompt caught!", err);
			if (!err) {
				throw err;
			}
			return err;
		} );
	}
};

module.exports = prompter;
