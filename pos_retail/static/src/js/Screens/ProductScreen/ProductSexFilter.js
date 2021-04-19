odoo.define('pos_retail.ProductSexFilter', function (require) {
    'use strict';

    const {useState, useExternalListener} = owl.hooks;
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const {posbus} = require('point_of_sale.utils');

    class ProductSexFilter extends PosComponent {
        constructor() {
            super(...arguments);
            this.config = this.props.config;
            this.state = useState({
                searchInput: '',
                selectedFieldId: this.config.searchFields.length ? 0 : null,
                showSearchFields: false,
                showFilterOptions: false,
                selectedFilter: {
                    name: this.config.filter.options[0] || 'Select Sex'
                },
            });
            useExternalListener(window, 'click', this._hideOptions);
        }

        mounted() {
            super.mounted();
            posbus.on('remove-filter-attribute', this, this._clearSelectedFilter);
        }

        _clearSelectedFilter() {
            this.state.selectedFilter = {
                'name': 'Select Sex'
            }
        }

        willUnmount() {
            super.willUnmount();
            posbus.off('remove-filter-attribute', this);
        }

       selectFilter(sex) {
            this.state.selectedFilter = sex;
            const selectedCategoryId = this.env.pos.get('selectedCategoryId');
            const query = $('.search >input').val();
            let products = []
            if (query) {
                products = this.env.pos.db.search_product_in_category(
                    selectedCategoryId,
                    query
                );
            } else {
                products = this.env.pos.db.get_all_products()
            }
            if (this.env.pos.model_selected) {
                products = products.filter(p => p.model_id && p.model_id[0] == this.env.pos.model_selected.id)
            }
            const products_will_display = products.filter(p => p.sex_id && p.sex_id[0] == sex.id)
            this.env.pos.search_extends_results = products_will_display;
            this.env.pos.sex_selected = sex
            posbus.trigger('switch-product-view')
        }

        get placeholder() {
            return this.props.placeholder;
        }

        /**
         * When vertical arrow keys are pressed, select fields for searching.
         * When enter key is pressed, trigger search event if there is searchInput.
         */
        onKeydown(event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
                this.state.selectedFieldId = this._fieldIdToSelect(event.key);
            } else if (event.key === 'Enter') {
                this.trigger('search', {
                    fieldValue: this.config.searchFields[this.state.selectedFieldId],
                    searchTerm: this.state.searchInput,
                });
                this.state.showSearchFields = false;
            } else {
                if (this.state.selectedFieldId === null && this.config.searchFields.length) {
                    this.state.selectedFieldId = 0;
                }
                this.state.showSearchFields = true;
            }
        }

        /**
         * Called when a search field is clicked.
         */
        onClickSearchField(id) {
            this.state.showSearchFields = false;
            this.trigger('search', {
                fieldValue: this.config.searchFields[id],
                searchTerm: this.state.searchInput,
            });
        }

        /**
         * Given an arrow key, return the next selectedFieldId.
         * E.g. If the selectedFieldId is 1 and ArrowDown is pressed, return 2.
         *
         * @param {string} key vertical arrow key
         */
        _fieldIdToSelect(key) {
            const length = this.config.searchFields.length;
            if (!length) return null;
            if (this.state.selectedFieldId === null) return 0;
            const current = this.state.selectedFieldId || length;
            return (current + (key === 'ArrowDown' ? 1 : -1)) % length;
        }

        _hideOptions() {
            this.state.showFilterOptions = false;
            this.state.showSearchFields = false;
        }
    }

    ProductSexFilter.template = 'ProductSexFilter';
    ProductSexFilter.defaultProps = {
        config: {
            searchFields: [],
            filter: {
                show: false,
                options: [],
            },
        },
        placeholder: 'Search ...',
    };

    Registries.Component.add(ProductSexFilter);

    return ProductSexFilter;
});
