import '../../stylus/components/_tables.styl'
import '../../stylus/components/_data-table.styl'

import DataIterable from '../../mixins/data-iterable'

import Head from './mixins/head'
import Body from './mixins/body'
import Foot from './mixins/foot'
import Progress from './mixins/progress'

import { createSimpleFunctional, getObjectValueByPath } from '../../util/helpers'

// Importing does not work properly
const VTableOverflow = createSimpleFunctional('v-table__overflow')

const VTableScroll = createSimpleFunctional('v-table__scroll')
const VTableAdditionalScroll = createSimpleFunctional('v-table__scroll--additional')

/* @vue/component */
export default {
  name: 'v-data-table',

  mixins: [DataIterable, Head, Body, Foot, Progress],

  props: {
    fixedHeaders: {
      type: Boolean,
      default: false
    },
    fixedColumn: {
      type: Boolean,
      default: false
    },
    additionalScroll: {
      type: Boolean,
      default: false
    },
    headers: {
      type: Array,
      default: () => []
    },
    headersLength: {
      type: Number
    },
    headerText: {
      type: String,
      default: 'text'
    },
    headerKey: {
      type: String,
      default: null
    },
    fixedHeader: Boolean,
    rowsPerPageText: {
      type: String,
      default: '$vuetify.dataTable.rowsPerPageText'
    },
    customFilter: {
      type: Function,
      default: (items, search, filter, headers) => {
        search = search.toString().toLowerCase()
        if (search.trim() === '') return items

        const props = headers.map(h => h.value)

        return items.filter(item => props.some(prop => filter(getObjectValueByPath(item, prop, item[prop]), search)))
      }
    }
  },

  data () {
    return {
      actionsClasses: 'v-datatable__actions',
      actionsRangeControlsClasses: 'v-datatable__actions__range-controls',
      actionsSelectClasses: 'v-datatable__actions__select',
      actionsPaginationClasses: 'v-datatable__actions__pagination',
      additionalScrollWidth: '0px'
    }
  },

  computed: {
    classes () {
      return {
        'v-table--fixed-header': this.fixedHeader,
        'v-datatable v-table': true,
        'v-datatable--select-all': this.selectAll !== false,
        ...this.themeClasses
      }
    },
    filteredItems () {
      return this.filteredItemsImpl(this.headers)
    },
    headerColumns () {
      return this.headersLength || this.headers.length + (this.selectAll !== false)
    }
  },

  created () {
    const firstSortable = this.headers.find(h => !('sortable' in h) || h.sortable)

    this.defaultPagination.sortBy = !this.disableInitialSort && firstSortable ? firstSortable.value : null

    this.initPagination()
  },

  mounted () {
    if (this.additionalScroll) {
      this.additionalScrollWidth = `${this.$refs.table.offsetWidth}px`
    }
  },

  updated () {
    if (this.additionalScroll) {
      this.additionalScrollWidth = `${this.$refs.table.offsetWidth}px`
    }
  },

  methods: {
    hasTag (elements, tag) {
      return Array.isArray(elements) && elements.find(e => e.tag === tag)
    },
    genTR (children, data = {}) {
      return this.$createElement('tr', data, children)
    },
    onScroll (event) {
      if (this.additionalScroll) {
        this.$refs.additionalScroll.scrollLeft = event.target.scrollLeft
      }
    },
    onAdditionalScroll (event) {
      if (this.additionalScroll && Math.abs(event.target.scrollLeft - this.$refs.scrollTable.scrollLeft) > 100) {
        event.preventDefault()
        this.$refs.scrollTable.scrollLeft = event.target.scrollLeft
      }
    }
  },

  render (h) {
    const additionalScroll = this.additionalScroll
      ? h(VTableAdditionalScroll, { ref: 'additionalScroll', on: { scroll: this.onAdditionalScroll } }, [
        h('div', {
          class: 'v-table__scroll--additional__element',
          style: { width: this.additionalScrollWidth }
        })
      ])
      : null

    const tableOverflow = h(VTableOverflow, {}, [
      h(
        VTableScroll,
        {
          ref: 'scrollTable',
          on: {
            scroll: this.onScroll
          }
        },
        [
          h(
            'table',
            {
              ref: 'table',
              class: this.classes
            },
            [this.genTHead(), this.genTBody(), this.genTFoot()]
          )
        ]
      ),
      this.genActionsFooter()
    ])

    return h('div', { class: 'v-datatable-root' }, [this.additionalScroll && additionalScroll, tableOverflow])
  }
}
