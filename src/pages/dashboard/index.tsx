import {useEffect, useState, useRef, useMemo} from 'react'
import {Text, View, Image, ScrollView} from '@tarojs/components'
import {AtTag, AtCard, AtTabBar, AtFab, AtCalendar, AtToast} from 'taro-ui'
import {navigateTo, redirectTo, request, getStorage, setStorage, getWeRunData} from "@tarojs/taro";
import Echarts, {EChartOption, EchartsHandle} from 'taro-react-echarts'
import echarts from '../../assets/echarts.min.js'
import {tabList} from "../../utils";
import _ from 'lodash';
import dayjs from 'dayjs'
import './index.scss'

const Sport = () => {
	// const [userInfo, setUserInfo] = useState<any>()
	const [showToast, setShowToast] = useState<boolean>(false)
	const [toastText, setToastText] = useState<string>('')
	const [signInDates, setSignInDates] = useState<string[]>([])
	const [stepInfoList, setStepInfoList] = useState<any[]>([])
	const [todayInfo, setTodayInfo] = useState<any>({})
	const [chartLoading, setChartLoading] = useState<boolean>(false)
	const [option1, setOption1] = useState<any>({})

	const echartsRef = useRef<EchartsHandle>(null)

	useEffect(() => {
		console.log('todayInfo:', todayInfo)
	}, [todayInfo]);

	useEffect(() => {
		setChartLoading(true);
		const today = dayjs();
		const oneWeekAgo = today.subtract(6, 'day');

		const filteredData = stepInfoList.filter((item) => {
			const itemDate = dayjs(item.date, 'YYYY-MM-DD');
			return itemDate.isAfter(oneWeekAgo) && itemDate.isBefore(today.add(1, 'day'));
		});

		const dates: any = [];
		const steps: any = [];
		filteredData.forEach((item: any) => {
			dates.push(dayjs(item.date).format('D')); // 只获取日期中的“几号”
			steps.push(item.step);
		});

		setOption1({
			grid: {
				containLabel: true,
				left: '5%',
				right: '5%',
			},
			legend: {
				top: 50,
				left: 'center',
				z: 100
			},
			tooltip: {
				trigger: 'axis',
				show: true,
				confine: true,
				formatter: function (params) {
					// 自定义 tooltip 的显示格式
					const date = params[0].axisValueLabel;
					const step = params[0].data;
					return `${date}日: ${step}步`;
				}
			},
			xAxis: {
				type: 'category',
				name: '日期',
				data: dates,
				// data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
			},
			yAxis: {
				type: 'value',
				minInterval: 1000,
				name: '步数',
			},
			series: [
				{
					data: steps,
					// data: [150, 230, 224, 218, 135, 147, 260],
					type: 'line',
					itemStyle: {
						color: '#76b624'
					}
				},
			]
		})
		setChartLoading(false)
	}, [stepInfoList]);

	useEffect(() => {
		getStorage({
			key: "userInfo",
			success: async (res: any) => {
				// console.log("userInfo:", res.data);
				// setUserInfo(res.data)
				fetchUserData(res.data.openid)
				await setStorage({
					key: 'userInfo',
					data: res.data
				})
				await getWeRunData({
					success: async (ret) => {
						// 拿 encryptedData 到开发者后台解密开放数据
						const encryptedData = ret.encryptedData
						// console.log('encryptedData:', encryptedData)
						request({
							method: 'POST',
							url: `${process.env.TARO_APP_BASE_URL}/user/decryptRunData`,
							data: {
								encryptedData,
								sessionKey: res.data.session_key,
								iv: ret.iv
							},
							success: (result: any) => {
								console.log('解密后数据：', result)
								const _stepInfoList = result.data.stepInfoList.map((item: any) => {
									return {
										date: dayjs.unix(item.timestamp).format('YYYY-MM-DD'),
										...item
									}
								})
								_.forEach(_stepInfoList, (item: any) => {
									if (item.date === dayjs().format('YYYY-MM-DD')) {
										setTodayInfo(item)
									}
								})
								// console.log('格式化后数据：', _stepInfoList)
								setStepInfoList(_stepInfoList)
							}
						})
					}
				})
			},
			fail: (err: any) => {
				console.error(err)
				setToastText('尚未登录！')
				setShowToast(true)
				closeToast()
			},
		});

	}, [])

	const fetchUserData = (openid) => {
		request({
			method: 'GET',
			url: `${process.env.TARO_APP_BASE_URL}/user/get`,
			data: {
				openid
			},
			success: async (res: any) => {
				console.log('fetchUserData res: ', res)
				if (res.data) {
					let marks = res.data.signInRecords.map((date: string) => {
						return {
							value: dayjs(date, 'YYYY-MM-DD').format('YYYY/MM/DD')
						}
					})
					setSignInDates(marks)
				}
			},
			fail: async (error: any) => {
				console.error(error)
			}
		})
	}

	const closeToast = () => {
		setTimeout(() => {
			setShowToast(false)
		}, 3000)
	}

	const routerHandler = (index: number) => {
		redirectTo({
			url: tabList[index]['path']
		})
	}

	return (
		<View className='container dashboard-page'>
			<AtToast isOpened={showToast} text={toastText} hasMask={true} duration={3000}/>
			<ScrollView scrollY scrollWithAnimation showScrollbar={false}>
				<AtCalendar
					value={null}
					onDayClick={() => {
					}}
					onDayLongClick={() => {
					}}
					onSelectDate={() => {
					}}
					// validDates={signInDates}
					marks={signInDates}/>

				<View className='today-step'>
					<View className='today-step-title'>
						今日步数
					</View>
					<View className='today-step-text'>
						{`${todayInfo.step}`}
					</View>
				</View>
				<View style={{padding: '0 8px'}}>
					<Echarts echarts={echarts} option={option1} ref={echartsRef} showLoading={chartLoading} style={{width: 'calc(100% - 16px)'}} />
				</View>

			</ScrollView>
			<AtTabBar
				fixed
				tabList={tabList}
				onClick={routerHandler}
				current={2}
			/>
		</View>
	)
}

export default Sport
