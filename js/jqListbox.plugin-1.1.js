/**
 * @fileOverview Contains the code of jqListbox plugin
 * @version 1.1
 * @author vision
 *
 * @namespace jqListbox
 */

/* vision@314pixels.hu */

/* global $:false, jQuery:false */
/* jslint plusplus: true */
(function ($) {
    "use strict";
    var pluginName = "jqListbox";

    $.fn[pluginName] = function (options) {
        var args = arguments, instance;

        if (options === undefined || typeof options === 'object') {
            // Initialize jqListbox on the selected elements
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    /* jshint -W055 */
                    $.data(this, 'plugin_' + pluginName, new jqListbox($(this), options));
                }
            });
        }
        // Call the passed method in jqListbox with the remaining parameters
        // only if the selection length is 1 because of getters
        if (this.length === 1) {
            instance = $.data(this[0], 'plugin_' + pluginName);
            if (instance instanceof jqListbox) {
                if (typeof instance[options] === 'function') {
                    return instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (instance.options.hasOwnProperty(options)) {
                    if (args.length === 1) {
                        // Getter
                        return instance.options[options];
                    }
                    // Setter
                    instance.options[options] = args[1];
                }
            }
        }
    };

    /**
     * Default options for the jqListbox plugin
     *
     * @namespace jqListbox.options
     *
     */
    $.fn[pluginName].defaults = {
        /**
         * jQuery compatible selector string to define which elements should be treated as list items in the listbox.
         *
         * @memberOf jqListbox.options
         * @default
         * @type {string}
         */
        itemSelector: 'li',
        /**
         * jQuery compatible selector string to define which element should be used to set the value to.
         * By default the value will be a JSON encoded string.
         *
         * @memberOf jqListbox.options
         * @default
         * @type {string}
         */
        targetInput: '#listbox-value',
        /**
         * Initial values to populate the listbox from.
         * The value must be a JS array.
         *
         * @memberOf jqListbox.options
         * @default
         * @type {Array|boolean}
         */
        initialValues: false,
        /**
         * Initial encoded values to populate the listbox from.
         * Use it to set the initial values from encoded (rendered) value without the need of a targetInput.
         *
         * @memberOf jqListbox.options
         * @default
         * @type {string|boolean}
         */
        initialEncodedValues: false,
        /**
         * CSS class used to mark selected items in the listbox.
         * This option can be used on most of the cases. For more complex item logic use the itemRenderer
         * and set selectedClass to false.
         *
         * @memberOf jqListbox.options
         * @default
         * @type {string|boolean}
         */
        selectedClass: 'selected',
        /**
         * If true then a simple click event handler will be added to your rendered list items.
         *
         * @memberOf jqListbox.options
         * @default
         * @type {string|boolean}
         */
        autoSelectOnClick: true,
        /**
         * If true then multiple selection is enabled in the listbox
         *
         * @memberOf jqListbox.options
         * @default
         * @type {boolean}
         */
        multiselect: true,
        /**
         * Function called when an item is rendered.
         * By default this returning a list item (<li>) containing your raw item Object.
         * You can override this function to render your item.
         *
         * @memberOf jqListbox.options
         * @method
         * @param {Object} item The item to be rendered
         * @param {int} pos The position of the item
         * @param {jqListbox} jqListbox The jqListbox instance
         * @default
         * @type {function}
         */
        itemRenderer: function (item, pos, jqListbox) {
            return '<li>' + item + '</li>';
        },
        /**
         * Function called when the final value of the listbox is rendered (for example when the value of a
         * target hidden input is set).
         * By default this returning the JSON stringified value of your items (array).
         *
         * @memberOf jqListbox.options
         * @method
         * @param {Array} items The items to be encoded
         * @default
         * @type {function}
         */
        listboxValueEncoder: function (items) {
            return JSON.stringify(items);
        },
        /**
         * Function called when decoding is needed from the rendered values. This function is typically
         * invoked if the target input has the encoded values upon initialization.
         *
         * @memberOf jqListbox.options
         * @method
         * @param {string} values The encoded values to be decoded
         * @default
         * @type {function}
         */
        listboxValueDecoder: function (values) {
            if (values.length > 0) {
                return JSON.parse(values);
            }
            return [];
        },
        /**
         * Optional callback function called before the initialization step.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onBeforeInit: false,
        /**
         * Optional callback function called after the initialization step.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onAfterInit: false,
        /**
         * Optional callback function called before a new element is inserted to the listbox via the
         * insert method. Return false from this function to avoid the insertion if the new item.
         * You can modify the items in this callback by returning the new array of items.
         * Multi insert will call this function only once not per-item!
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {Array} items The new item(s) to be inserted. Single element array on simmple insert() and multi element array on multiInsert()
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onBeforeItemInsert: false,
        /**
         * Optional callback function called after a new element is inserted to the listbox via the
         * insert method.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {Array} items The new item(s) inserted. Single element array on simmple insert() and multi element array on multiInsert()
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onAfterItemInsert: false,
        /**
         * Optional callback function called before an element is updated in the listbox via the
         * update method. Return a new array from this function to change the updated elements.
         * Return false from this function to avoid the update.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {Array} items The selected item(s)
         * @param {Array} updateTo Array of updated items
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onBeforeItemUpdate: false,
        /**
         * Optional callback function called after an element is updated in the listbox via the
         * update method.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {Array} item The selected item(s)
         * @param {Array} updatedTo Array of updated items
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onAfterItemUpdate: false,
        /**
         * Optional callback function called before an element is removed from the listbox via the
         * remove method. Return false from this function to avoid the deletion.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {Array} items The selected item(s)
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onBeforeItemRemove: false,
        /**
         * Optional callback function called after an element is removed from the listbox via the
         * remove method.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {Array} items The selected item(s)
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onAfterItemRemove: false,
        /**
         * Optional callback function called before the listbox is cleared via the
         * clear method. Return false from this function to avoid the clearing.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onBeforeClear: false,
        /**
         * Optional callback function called after the listbox has cleared via the clear method.
         *
         * @method
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onAfterClear: false,
        /**
         * Optional function called after any change in the items.
         * This function will be called after insert, update, remove, clear, movedown and moveup.
         * The change event will be passed as parameter.
         *
         * @method onChanged
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {string} event The name of the event: insert, update, remove, clear, movedown or moveup.
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onChanged: false,
        /**
         * Optional function called before the render step.
         * Return false form your function to avoid rendering logic.
         *
         * @method onBeforeRender
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onBeforeRender: false,
        /**
         * Optional function called after the render step.
         *
         * @method onAfterRender
         * @default false
         * @this {jQuery} The container jQuery element
         * @param {jqListbox} jqListbox The jqListbox instance
         * @type {boolean|function}
         */
        onAfterRender: false
    };
    /**
     * Creates a new jqListbox
     *
     * @param {jQuery} element
     * @param {Object} options
     *
     * @constructor
     *
     */
    /* jshint -W055 */
    /* jshint -W040 */
    /**
     * @class jqListbox
     * @namespace jqListbox
     *
     * @param element
     * @param options
     */
    function jqListbox(element, options) {
        this.el = element;
        this.$el = $(element);
        this.options = $.extend({}, $.fn[pluginName].defaults, options);
        this.init();
    }

    // Prototype
    jqListbox.prototype = {
        /**
         * The internally stored list items (as array)
         *
         * @var {Array} items
         * @memberOf jqListbox
         */
        items: [],
        /**
         * Array of the currently selected item indices
         *
         * @var {Array} selectedPositions
         * @memberOf jqListbox
         */
        selectedPositions: [],
        /**
         * Initializes the jqListbox
         *
         * @method init
         * @memberOf jqListbox
         */
        init: function () {
            if (typeof (this.options.onBeforeInit) === "function") {
                this.options.onBeforeInit.apply(this.$el, [this]);
            }
            // Clear items without the clear method to avoid callbacks
            this.items = [];
            this.selectedPositions = [];
            // Initialize items
            this.initItems();
            // Setup click handler if option is set
            if (this.options.autoSelectOnClick) {
                this.setupAutoClickHandler();
            }
            // Render time
            this.render();
            if (typeof (this.options.onAfterInit) === "function") {
                this.options.onAfterInit.apply(this.$el, [this]);
            }
        },
        /**
         * Setup auto click handler
         *
         * @method setupAutoClickHandler
         * @memberOf jqListbox
         */
        setupAutoClickHandler: function () {
            var that = this;
            this.$el.on('click', this.options.itemSelector, function (e) {
                var pos = $(this).index();
                if (!that.isSelected(pos)) {
                    that.select(pos);
                } else {
                    that.deselect(pos);
                }
                e.preventDefault();
                return false;
            });
        },
        /**
         * Resets the listbox back to its staring state
         *
         * @method reset
         * @memberOf jqListbox
         */
        reset: function () {
            this.clear();
            this.initItems();
            this.render();
        },
        /**
         * Initialize the items based on the options
         *
         * @method initItems
         * @memberOf jqListbox
         */
        initItems: function () {
            if (this.options.initialValues !== false) {
                this.setFromArray(this.options.initialValues);
            } else if (this.options.initialEncodedValues !== false) {
                this.setFromTargetValue(this.options.initialEncodedValues);
            } else if (this.options.targetInput !== false && $(this.options.targetInput).length === 1) {
                this.setFromTargetValue($(this.options.targetInput).val());
            }
        },
        /**
         * Returns the element by position
         *
         * @param {int} pos Position
         *
         * @method getByIndex
         * @memberOf jqListbox
         *
         * @return {Object} The element in position
         */
        getItemByIndex: function (pos) {
            return this.items[pos];
        },
        /**
         * Calls onChanged callback if exists
         *
         * @method testOnChanged
         * @memberOf jqListbox
         */
        testOnChanged: function (event) {
            if (typeof (this.options.onChanged) === "function") {
                this.options.onChanged.apply(this.$el, [event, this]);
            }
        },
        /**
         * Calls onBeforeItemInsert callback if exists
         *
         * @method testOnBeforeItemInsert
         * @memberOf jqListbox
         *
         * @return {Object} New item to be inserted, false to avoid insertion
         */
        testOnBeforeItemInsert: function (items) {
            var callback = items, test;
            if (typeof (this.options.onBeforeItemInsert) === "function") {
                test = this.options.onBeforeItemInsert.apply(this.$el, [items, this]);
                if (test !== undefined) {
                    callback = test;
                }
            }
            return callback;
        },
        /**
         * Calls onAfterItemInsert callback if exists
         *
         * @method testOnAfterItemInsert
         * @memberOf jqListbox
         */
        testOnAfterItemInsert: function (items) {
            if (typeof (this.options.onAfterItemInsert) === "function") {
                this.options.onAfterItemInsert.apply(this.$el, [items, this]);
            }
        },
        /**
         * Calls onBeforeItemUpdate callback if exists
         *
         * @method testOnBeforeItemUpdate
         * @memberOf jqListbox
         *
         * @return {Array|boolean} New updated item(s)
         */
        testOnBeforeItemUpdate: function (items, updateTo) {
            var callback = updateTo, test;
            if (typeof (this.options.onBeforeItemUpdate) === "function") {
                test = this.options.onBeforeItemUpdate.apply(this.$el, [items, updateTo, this]);
                if (test !== undefined) {
                    callback = test;
                }
            }
            return callback;
        },
        /**
         * Calls onAfterItemUpdate callback if exists
         *
         * @method testOnAfterItemUpdate
         * @memberOf jqListbox
         */
        testOnAfterItemUpdate: function (items, updatedTo) {
            if (typeof (this.options.onAfterItemUpdate) === "function") {
                this.options.onAfterItemUpdate.apply(this.$el, [items, updatedTo, this]);
            }
        },
        /**
         * Calls onBeforeItemRemove callback if exists
         *
         * @method testOnBeforeItemRemove
         * @memberOf jqListbox
         *
         * @return {Array|boolean} Items to be removed
         */
        testOnBeforeItemRemove: function (positions) {
            var callback = positions, test;
            if (typeof (this.options.onBeforeItemRemove) === "function") {
                test = this.options.onBeforeItemRemove.apply(this.$el, [positions, this]);
                if (test !== undefined) {
                    callback = test;
                }
            }
            return callback;
        },
        /**
         * Calls onAfterItemRemove callback if exists
         *
         * @method testOnAfterItemRemove
         * @memberOf jqListbox
         */
        testOnAfterItemRemove: function () {
            if (typeof (this.options.onAfterItemRemove) === "function") {
                this.options.onAfterItemRemove.apply(this.$el, [this]);
            }
        },
        /**
         * Inserts a new element to the end of the listbox
         *
         * @param {Object} item The item to be inserted
         *
         * @method insert
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        insert: function (item) {
            var callback = this.testOnBeforeItemInsert([item]);
            if (callback !== false && callback.length !== 0) {
                item = callback[0];
                this.items.push(item);
                this.render();
                this.testOnAfterItemInsert([item]);
                this.testOnChanged('insert');
            }
            return this.items.length;
        },
        /**
         * Inserts a new element at the specified position
         *
         * @param {Object} item The item to be inserted
         * @param {int} position The index of the position. Negative value means counting from the end.
         *
         * @method insertAt
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        insertAt: function (item, position) {
            if (position === this.items.length) {
                return this.insert(item);
            }
            var callback = this.testOnBeforeItemInsert([item]);
            if (callback !== false && callback.length !== 0) {
                item = callback[0];
                this.items.splice(position, 0, item);
                this.render();
                this.testOnAfterItemInsert([item]);
                this.testOnChanged('insert');
            }
            return this.items.length;
        },
        /**
         * Inserts new elements from the array to the end of the listbox
         *
         * @param {Array} items Array of items to be inserted
         *
         * @method insertMulti
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        insertMulti: function (items) {
            var callback = this.testOnBeforeItemInsert(items);
            if (callback !== false && callback.length !== 0) {
                items = callback;
                this.items = this.items.concat(items);
                this.render();
                this.testOnAfterItemInsert(items);
                this.testOnChanged('insert');
            }
            return this.items.length;
        },
        /**
         * Inserts new elements from the array to the specified position of the listbox
         *
         * @param {Array} items Array of items to be inserted
         * @param {int} position The index of the position. Negative value means counting from the end.
         *
         * @method insertMultiAt
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        insertMultiAt: function (items, position) {
            if (position === this.items.length) {
                return this.insertMulti(items);
            }
            var callback = this.testOnBeforeItemInsert(items);
            if (callback !== false && callback.length !== 0) {
                items = callback;
                this.items.splice.apply(this.items, [position, 0].concat(items));
                this.render();
                this.testOnAfterItemInsert(items);
                this.testOnChanged('insert');
            }
            return this.items.length;
        },
        /**
         * Updates the currently selected element(s) with the new data.
         * If multiple items are selected then all of them will be updated.
         *
         * @param {Object} updatedItem The new element data
         *
         * @method update
         * @memberOf jqListbox
         *
         * @return {int} The number of updated items
         */
        update: function (updatedItem) {
            var idx;
            if (this.selectedPositions.length > 0) {
                updatedItem = this.testOnBeforeItemUpdate(this.getSelectedItems(), [updatedItem]);
                if (updatedItem !== false) {
                    updatedItem = updatedItem[0];
                    for (idx = 0; idx < this.selectedPositions.length; idx++) {
                        this.items[this.selectedPositions[idx]] = updatedItem;
                    }
                    this.render();
                    this.testOnAfterItemUpdate(this.getSelectedItems(), updatedItem);
                    this.testOnChanged('update');
                }
            }
            return this.selectedPositions.length;
        },
        /**
         * Updates all of the currently selected element with the new datas
         * updatedItems should have the same number of element as the currently selected elements
         * Selected elements will be updated one-by-one with the data in the updatedItems
         *
         * @param {Array} updatedItems Array of Objects storing the new data
         *
         * @method updateMulti
         * @memberOf jqListbox
         *
         * @return {int} The number of updated items
         */
        updateMulti: function (updatedItems) {
            var idx, j = 0, updatedItem = {};
            if (this.selectedPositions.length > 0 && updatedItems.length > 0) {
                updatedItems = this.testOnBeforeItemUpdate(this.getSelectedItems(), updatedItems);
                if (updatedItems !== false) {
                    for (idx = 0; idx < this.selectedPositions.length; idx++) {
                        updatedItem = updatedItems[j];
                        this.items[this.selectedPositions[idx]] = updatedItem;
                        j++;
                        if (j >= updatedItems.length) {
                            j = 0;
                        }
                    }
                    this.render();
                    this.testOnAfterItemUpdate(this.getSelectedItems(), updatedItems);
                    this.testOnChanged('update');
                }
            }
            return this.selectedPositions.length;
        },
        /**
         * Updates the element in position
         *
         * @param {Object} updatedItem The new element data
         * @param {int} position The position (index) of the item to be updated. Negative value means counting from the end.
         *
         * @method update
         * @memberOf jqListbox
         *
         * @return {Object} The updated item
         */
        updateAt: function (updatedItem, position) {
            if (position < 0) {
                position = this.items.length + position;
            }
            if (position >= 0 && position < this.items.length) {

                updatedItem = this.testOnBeforeItemUpdate([this.getItemByIndex(position)], [updatedItem]);
                if (updatedItem === false) {
                    return this.getItemByIndex(position);
                }
                updatedItem = updatedItem[0];
                this.items[position] = updatedItem;
                this.render();
                this.testOnAfterItemUpdate(this.getItemByIndex(position), [updatedItem]);
                this.testOnChanged('update');
                return updatedItem;
            }
        },
        /**
         * Remove all of the currently selected items.
         *
         * @method remove
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        remove: function () {
            var tmp = [], selPos = [], idx = 0, callback, pos;
            if (this.selectedPositions.length > 0) {
                callback = this.testOnBeforeItemRemove(this.selectedPositions);
                if (callback !== false && callback.length !== 0) {
                    for (idx = 0; idx < this.items.length; idx++) {
                        pos = parseInt(idx, 10);
                        if (callback.indexOf(pos) === -1) {
                            tmp.push(this.items[pos]);
                            if (this.selectedPositions.indexOf(pos) !== -1) {
                                selPos.push(tmp.length);
                            }
                        }
                    }
                    this.items = tmp.slice();
                    this.selectedPositions = selPos.slice();
                    this.render();
                    this.testOnAfterItemRemove();
                    this.testOnChanged('remove');
                }
            }
            return this.items.length;
        },
        /**
         * Remove the element in position.
         *
         * @param {int} position The position (index) of the item to be removed. Negative value means counting from the end.
         *
         * @method removeByIndex
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        removeByIndex: function (position) {
            var callback = this.testOnBeforeItemRemove([position]), selPos;
            if (callback !== false && callback.length === 1) {
                selPos = this.selectedPositions.indexOf(position);
                if (selPos > -1) {
                    this.selectedPositions.splice(selPos, -1);
                }
                this.items.splice(position, 1);
                this.render();
                this.testOnAfterItemRemove();
                this.testOnChanged('remove');
            }
            return this.items.length;
        },
        /**
         * Clears the listbox
         *
         * @method clear
         * @memberOf jqListbox
         */
        clear: function () {
            if (typeof (this.options.onBeforeClear) === "function") {
                var test = this.options.onBeforeClear.apply(this.$el, [this]);
                if (test === false) {
                    return false;
                }
            }
            this.items = [];
            this.selectedPositions = [];
            this.render();
            if (typeof (this.options.onAfterClear) === "function") {
                this.options.onAfterClear.apply(this.$el, [this]);
            }
            this.testOnChanged('clear');
        },
        /**
         * Move up all of the currently selected items.
         *
         * @method moveup
         * @memberOf jqListbox
         */
        moveup: function () {
            var i, tmp;
            if (this.selectedPositions.length > 0) {
                if (this.selectedPositions[0] === 0) {
                    this.shiftElementsUp();
                } else if (this.selectedPositions.length === 1) {
                    this.switchElements(this.selectedPositions[0], this.selectedPositions[0] - 1);
                } else {
                    tmp = this.selectedPositions.slice();
                    for (i = 0; i < tmp.length; i++) {
                        this.switchElements(tmp[i], tmp[i] - 1);
                    }
                }
                this.render();
                this.testOnChanged('moveup');
            }
        },
        /**
         * Move up the item by position.
         *
         * @param {int} position The position (index) of the item
         *
         * @method moveup
         * @memberOf jqListbox
         */
        moveupByIndex: function (position) {
            if (position < this.items.length) {
                if (position === 0) {
                    this.shiftElementsUp();
                } else {
                    this.switchElements(position, position - 1);
                }
                this.render();
                this.testOnChanged('moveup');
            }
        },
        /**
         * Move down all of the currently selected items.
         *
         * @method movedown
         * @memberOf jqListbox
         */
        movedown: function () {
            var i, tmp;
            if (this.selectedPositions.length > 0) {
                if (this.selectedPositions[this.selectedPositions.length - 1] === this.items.length - 1) {
                    this.shiftElementsDown();
                } else if (this.selectedPositions.length === 1) {
                    this.switchElements(this.selectedPositions[0], this.selectedPositions[0] + 1);
                } else {
                    tmp = this.selectedPositions.slice();
                    tmp.reverse();
                    for (i = 0; i < tmp.length; i++) {
                        this.switchElements(tmp[i], tmp[i] + 1);
                    }
                }
                this.render();
                this.testOnChanged('movedown');
            }
        },
        /**
         * Move down the item in position
         *
         * @param {int} position The position (index) of the item
         *
         * @method movedownByIndex
         * @memberOf jqListbox
         */
        movedownByIndex: function (position) {
            if (position < this.items.length) {
                if (position === this.items.length - 1) {
                    this.shiftElementsDown();
                } else {
                    this.switchElements(position, position + 1);
                }
                this.render();
                this.testOnChanged('movedown');
            }
        },
        /**
         * Switches the positions of two elements. This method won't trigger the render() method!
         *
         * @param {int} pos1 The position of the first element
         * @param {int} pos2 The position of the second element
         */
        switchElements: function (pos1, pos2) {
            var iop1, iop2, tmp;
            if (pos1 !== pos2) {
                tmp = this.items[pos1];
                this.items[pos1] = this.items[pos2];
                this.items[pos2] = tmp;
                // check for selected positions
                iop1 = this.selectedPositions.indexOf(pos1);
                iop2 = this.selectedPositions.indexOf(pos2);
                if ((iop1 !== -1 && iop2 === -1) || (iop1 === -1 && iop2 !== -1)) {
                    if (iop1 !== -1) {
                        this.selectedPositions.splice(iop1, 1);
                        this.selectedPositions.push(pos2);
                    }
                    if (iop2 !== -1) {
                        this.selectedPositions.splice(iop2, 1);
                        this.selectedPositions.push(pos1);
                    }
                }
                this.selectedPositions.sort();
            }
        },
        /**
         * Shift every elements up (left) in the array. This method won't trigger the render() method!
         */
        shiftElementsUp: function () {
            var tmp, tmpPos, i = 0;
            if (this.items.length > 0) {
                // Elements
                tmp = this.items.slice(1);
                tmp.push(this.items[0]);
                this.items = tmp.slice();
                if (this.selectedPositions.length > 0) {
                    // Selected elements - decrease every position by one
                    tmpPos = [];
                    for (i = 0; i < this.selectedPositions.length; i++) {
                        if (this.selectedPositions[i] === 0) {
                            tmpPos.push(this.items.length - 1);
                        } else {
                            tmpPos.push(this.selectedPositions[i] - 1);
                        }
                    }
                    this.selectedPositions = tmpPos.slice();
                    this.selectedPositions.sort();
                }
            }
        },
        /**
         * Shift every elements down (right) in the array. This method won't trigger the render() method!
         */
        shiftElementsDown: function () {
            var tmp, tmpPos = [], i = 0;
            if (this.items.length > 0) {
                tmp = [this.items.pop()].concat(this.items.slice());
                this.items = tmp.slice();
                if (this.selectedPositions.length > 0) {
                    // Selected elements - increase every position by one
                    tmpPos = [];
                    if (this.selectedPositions[this.selectedPositions.length - 1] === this.items.length - 1) {
                        tmpPos.push(0);
                    } else {
                        tmpPos.push(this.selectedPositions[this.selectedPositions.length - 1] + 1);
                    }
                    for (i = 0; i < this.selectedPositions.length - 1; i++) {
                        //if (this.selectedPositions[i] === this.items.length - 1) {
                        //    tmpPos.push(0);
                        //} else {
                        tmpPos.push(this.selectedPositions[i] + 1);
                        //}
                    }
                    this.selectedPositions = tmpPos.slice();
                    this.selectedPositions.sort();
                }
            }
        },
        /**
         * Transfer selected elements to another jqListbox.
         * The two jqListbox should contain the same type of elements because this method will call the other
         * listbox's insert method.
         *
         * @param {jqListbox} listbox The other jqListbox instance
         * @param {Boolean} copy Set this parameter to true to copy items instead of move
         *
         * @method transferSelectedTo
         * @memberOf jqListbox
         */
        transferSelectedTo: function (listbox, copy) {
            if (this.countSelected() > 0) {
                var items = this.getSelectedItems(), i = 0;
                for (i = 0; i < items.length; i++) {
                    listbox.jqListbox('insert', items[i]);
                }
                if (copy !== true) {
                    this.remove();
                }
            }
        },
        /**
         * Transfer the item by index to another jqListbox.
         * The two jqListbox should contain the same type of elements because this method will call the other
         * listbox's insert method.
         *
         * @param {jqListbox} listbox The other jqListbox instance
         * @param {int} index The index of the element
         * @param {Boolean} copy Set this parameter to true to copy the item instead of move
         *
         * @method transferByIndexTo
         * @memberOf jqListbox
         */
        transferByIndexTo: function (listbox, index, copy) {
            if (index >= 0 && index < this.count()) {
                listbox.jqListbox('insert', this.getItemByIndex(index));
                if (copy !== true) {
                    this.removeByIndex(index);
                }
            }
        },
        /**
         * Transfer multiple items by index to another jqListbox.
         * The two jqListbox should contain the same type of elements because this method will call the other
         * listbox's insert method.
         *
         * @param {jqListbox} listbox The other jqListbox instance
         * @param {Array} indices The indices of the elements to transfer
         * @param {Boolean} copy Set this parameter to true to copy the items instead of move
         *
         * @method transferByIndexMultiTo
         * @memberOf jqListbox
         */
        transferByIndexMultiTo: function (listbox, indices, copy) {
            if (indices.length > 0) {
                indices.sort(function (a, b) {
                    return a - b;
                });
                var i;
                if (copy !== true) {
                    // Move
                    // We must decrease the index on every iteration because of removal of preceding elements
                    for (i = 0; i < indices.length; i++) {
                        listbox.jqListbox('insert', this.getItemByIndex(indices[i] - i));
                        this.removeByIndex(indices[i] - i);
                    }
                } else {
                    // Copy
                    for (i = 0; i < indices.length; i++) {
                        listbox.jqListbox('insert', this.getItemByIndex(indices[i]));
                    }
                }
            }
        },
        /**
         * Returns the rendered (encoded) target value
         *
         * @method getTargetValue
         * @memberOf jqListbox
         *
         * @return The rendered target value
         */
        getTargetValue: function () {
            return this.options.listboxValueEncoder(this.items);
        },
        /**
         * Returns all of the currently stored elements as array
         *
         * @method getAsArray
         * @memberOf jqListbox
         *
         * @return {Array}
         */
        getAsArray: function () {
            return this.items;
        },
        /**
         * Sets the listbox items from an array. This will overwrite any currently stored elements.
         *
         * @param {Array} newItems The new items
         *
         * @method setFromArray
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        setFromArray: function (newItems) {
            this.items = newItems.slice();
            return this.items.length;
        },
        /**
         * Sets the listbox items from an the target value. This will overwrite any currently stored elements.
         *
         * @param {Object} data The encoded (rendered) target value to be used
         *
         * @method setFromTargetValue
         * @memberOf jqListbox
         *
         * @return {int} The new length of the listbox
         */
        setFromTargetValue: function (data) {
            var decoded = this.options.listboxValueDecoder.apply(this.$el, [data]);
            this.setFromArray(decoded);
            return this.items.length;
        },
        /**
         * Returns the number of elements in the listbox
         *
         * @method count
         * @memberOf jqListbox
         *
         * @return {int} The length of the listbox
         */
        count: function () {
            return this.items.length;
        },
        /**
         * Returns the number of selected elements in the listbox
         *
         * @method countSelected
         * @memberOf jqListbox
         *
         * @return {int} The number of selected elements in the listbox
         */
        countSelected: function () {
            return this.selectedPositions.length;
        },
        /**
         * Selects an element by index
         *
         * @method select
         * @memberOf jqListbox
         *
         * @param {int} position
         */
        select: function (position) {
            if (this.selectedPositions.indexOf(position) === -1 && position < this.items.length) {
                if (this.options.multiselect === false && this.selectedPositions.length > 0) {
                    this.selectedPositions = [];
                }
                this.selectedPositions.push(position);
                this.selectedPositions.sort();
                this.render();
            }
        },
        /**
         * Deselects the element by index if it is selected
         *
         * @method deselect
         * @memberOf jqListbox
         *
         * @param {int} position
         */
        deselect: function (position) {
            var idx = this.selectedPositions.indexOf(position);
            if (idx > -1) {
                this.selectedPositions.splice(idx, 1);
                this.render();
            }
        },
        /**
         * Select all elements
         *
         * @method selectAll
         * @memberOf jqListbox
         */
        selectAll: function () {
            var i;
            if (this.options.multiselect === true) {
                this.selectedPositions = [];
                for (i = 0; i < this.items.length; i++) {
                    this.selectedPositions.push(i);
                }
                this.selectedPositions.sort();
                this.render();
            }
        },
        /**
         * Deselects any selected element
         *
         * @method deselectAll
         * @memberOf jqListbox
         */
        deselectAll: function () {
            this.selectedPositions = [];
            this.render();
        },
        /**
         * Returns an array of the selected elements
         *
         * @method getSelected
         * @memberOf jqListbox
         *
         * return {Array}
         */
        getSelected: function () {
            return this.selectedPositions;
        },
        /**
         * Returns true if the item in position is selected
         *
         * @method isSelected
         * @memberOf jqListbox
         *
         * @return {boolean}
         */
        isSelected: function (position) {
            return this.selectedPositions.indexOf(position) !== -1;
        },
        /**
         * Returns all selected elements
         *
         * @method isSelected
         * @memberOf getSelectedItems
         *
         * @return {Array}
         */
        getSelectedItems: function () {
            return this.items.filter(function (item, index, arr) {
                return this.selectedPositions.indexOf(index) > -1;
            }, this);
        },
        /**
         * Returns a jQuery object with the elements of selected listbox items
         *
         * @method getSelectedJQueryItems
         * @memberOf jqListbox
         *
         * @return {jQuery}
         */
        getSelectedJQueryItems: function () {
            var me = this;
            return this.$el.find(this.options.itemSelector).filter(function (idx, el) {
                return me.selectedPositions.indexOf(idx) > -1;
            });
        },
        /**
         * Returns the jQuery element by position
         *
         * @method getJQueryItemByIndex
         * @memberOf jqListbox
         *
         * @param {int} pos The position of the element to be returned
         *
         * @return {jQuery}
         */
        getJQueryItemByIndex: function (pos) {
            return this.$el.find(this.options.itemSelector).eq(pos);
        },
        /**
         * Re-render all of the items in the listbox
         */
        render: function () {
            var test, targetValue, i, rendered, li;
            if (typeof (this.options.onBeforeRender) === "function") {
                test = this.options.onBeforeRender.apply(this.$el, [this]);
                if (test === false) {
                    return false;
                }
            }
            // Render target value
            targetValue = this.getTargetValue();
            if (this.options.targetInput !== false) {
                $(this.options.targetInput).val(targetValue);
            }

            this.$el.empty();
            for (i = 0; i < this.items.length; i++) {
                i = parseInt(i, 10);
                rendered = this.options.itemRenderer.apply(this.$el, [this.items[i], parseInt(i, 10), this]);
                li = $(rendered).appendTo(this.$el);
                if (this.options.selectedClass !== false && this.isSelected(i)) {
                    li.addClass(this.options.selectedClass);
                }
            }
            if (typeof (this.options.onAfterRender) === "function") {
                this.options.onAfterRender.apply(this.$el, [this]);
            }
        },
        /**
         * Calls the passed callback on every items.
         * Your custom callback function will get the following parameters:
         * item object, item position, jquery item, jqListbox instance
         * Scope: the jQuery element which has the jqListbox initialized
         *
         * @method itemWalk
         * @memberOf jqListbox
         */
        itemWalk: function (fn) {
            var i;
            if (this.items.length > 0) {
                for (i = 0; i < this.items.length; i++) {
                    fn.apply(this.$el, [this.items[i], i, this.$el.find(this.options.itemSelector).eq(i), this]);
                }
            }
        },
        /**
         * Calls the passed callback on every selected items.
         * Your custom callback function will get the following parameters:
         * item object, item position, jquery item, jqListbox instance
         * Scope: the jQuery element which has the jqListbox initialized
         *
         * @method selectedWalk
         * @memberOf jqListbox
         */
        selectedWalk: function (fn) {
            var jqItems, i, pos;
            if (this.selectedPositions.length > 0) {
                jqItems = this.$el.find(this.options.itemSelector);
                for (i = 0; i < this.selectedPositions.length; i++) {
                    pos = this.selectedPositions[i];
                    fn.apply(this.$el, [this.items[pos], pos, jqItems.eq(pos), this]);
                }
            }
        }
    };
}(jQuery));