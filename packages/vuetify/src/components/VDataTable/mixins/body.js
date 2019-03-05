import ExpandTransitionGenerator from '../../transitions/expand-transition'

import { getObjectValueByPath } from '../../../util/helpers'

/* @vue/component */
export default {
  methods: {
    genTBody () {
      const children = this.genItems()

      return this.$createElement('tbody', children)
    },
    genExpandedRow (props) {
      const children = []

      if (this.isExpanded(props.item)) {
        const expand = this.$createElement(
          'div',
          {
            class: 'v-datatable__expand-content',
            key: getObjectValueByPath(props.item, this.itemKey)
          },
          [this.$scopedSlots.expand(props)]
        )

        children.push(expand)
      }

      const transition = this.$createElement(
        'transition-group',
        {
          class: 'v-datatable__expand-col',
          attrs: { colspan: this.headerColumns },
          props: {
            tag: 'td'
          },
          on: ExpandTransitionGenerator('v-datatable__expand-col--expanded')
        },
        children
      )

      return this.genTR([transition], { class: 'v-datatable__expand-row' })
    },

    augmentRow (row) {
      const tds = row.tag === 'td' ? [row] : this.hasTag(row, 'td') ? row : row[0].children

      let i = 0
      for (const td of tds) {
        if (this.headers[i].fixed === true && td.tag === 'td') {
          td.data = td.data || {}
          td.data.class = `${td.data['class'] || ''} fixed-column`.trim()
          td.data.style = {
            width: this.headers[i].width
          }
          i++
        }
      }
    },

    genFilteredItems () {
      if (!this.$scopedSlots.items) {
        return null
      }

      const rows = []
      for (let index = 0, len = this.filteredItems.length; index < len; ++index) {
        const item = this.filteredItems[index]
        const props = this.createProps(item, index)
        const row = this.$scopedSlots.items(props)

        this.augmentRow(row)

        rows.push(
          this.hasTag(row, 'td')
            ? this.genTR(row, {
              key: this.itemKey ? getObjectValueByPath(props.item, this.itemKey) : index,
              attrs: { active: this.isSelected(item) }
            })
            : row
        )

        if (this.$scopedSlots.expand) {
          const expandRow = this.genExpandedRow(props)
          rows.push(expandRow)
        }
      }

      return rows
    },
    genEmptyItems (content) {
      if (this.hasTag(content, 'tr')) {
        return content
      } else if (this.hasTag(content, 'td')) {
        return this.genTR(content)
      } else {
        return this.genTR([
          this.$createElement(
            'td',
            {
              class: {
                'text-xs-center': typeof content === 'string'
              },
              attrs: { colspan: this.headerColumns }
            },
            content
          )
        ])
      }
    }
  }
}
