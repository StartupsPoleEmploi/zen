import React from 'react'

import { Tabs } from 'antd'

import Global from './component/global/Global'
import UsersRetention from './component/retention/UsersRetention'
import MetricsForm from './component/metrics/MetricsForm'
import RepartitionForm from './component/repartition/RepartitionForm'

import ZnContent from '../../components/ZnContent'
import ZnHeader from '../../components/ZnHeader'
import updateUrl, { getUrlParams } from '../../components/history'

const { TabPane } = Tabs

export default function Users() {
  function onTabChange(key) {
    if (key === '1') updateUrl('/zen-admin?activeTab=global')
    if (key === '2') updateUrl('/zen-admin?activeTab=metrics')
    if (key === '3') updateUrl('/zen-admin?activeTab=repartition')
    if (key === '4') updateUrl('/zen-admin?activeTab=retention')
  }

  function computeActiveKey() {
    const activeTab = getUrlParams('activeTab')
    if (activeTab) {
      if (activeTab === 'global') return '1'
      if (activeTab === 'metrics') return '2'
      if (activeTab === 'repartition') return '3'
      if (activeTab === 'retention') return '4'
    }

    return
  }
  const activeKey = computeActiveKey()
  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Tableaux de bord" />
      <ZnContent>
        <Tabs
          tabPosition="top"
          style={{ background: 'white', paddingBottom: '3rem' }}
          defaultActiveKey={activeKey}
          onChange={onTabChange}
        >
          <TabPane tab="Global" key="1">
            <Global />
          </TabPane>
          <TabPane tab="Comparaisons de périodes" key="2">
            <MetricsForm />
          </TabPane>
          <TabPane tab="Répartition géographique" key="3">
            <RepartitionForm />
          </TabPane>
          <TabPane tab="Rétention" key="4">
            <UsersRetention />
          </TabPane>
        </Tabs>
      </ZnContent>
    </div>
  )
}
