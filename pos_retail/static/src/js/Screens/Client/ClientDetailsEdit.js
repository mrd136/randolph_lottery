odoo.define('pos_retail.ClientDetailsEdit', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ClientDetailsEdit = require('point_of_sale.ClientDetailsEdit');
    const {useState} = owl.hooks;
    const {useListener} = require('web.custom_hooks');
    const models = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');

    const RetailClientDetailsEdit = (ClientDetailsEdit) =>
        class extends ClientDetailsEdit {

            ordersPurchased() {

            }
            saveChanges() {
                let processedChanges = {};
                for (let [key, value] of Object.entries(this.changes)) {
                    if (this.intFields.includes(key)) {
                        processedChanges[key] = parseInt(value) || false;
                    } else {
                        processedChanges[key] = value;
                    }
                }
                if (!processedChanges.name && !this.props.partner.id) {
                    return this.showPopup('ErrorPopup', {
                        title: _('A Customer Name Is Required'),
                    });
                }
                processedChanges.id = this.props.partner.id || false;
                if (this.props.partner && this.props.partner['parent_id']) {
                    this.changes['parent_id'] = this.props.partner['parent_id']
                }
                if (this.props.partner.id) {
                    this.trigger('save-changes', {processedChanges});
                } else {
                    super.saveChanges()
                }
            }
        }
    Registries.Component.extend(ClientDetailsEdit, RetailClientDetailsEdit);

    return RetailClientDetailsEdit;
});
