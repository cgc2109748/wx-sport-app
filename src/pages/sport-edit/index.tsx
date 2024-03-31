import {useEffect, useState} from "react";
import {View, Text, Picker} from "@tarojs/components";
import {AtForm, AtInput, AtButton, AtList, AtListItem, AtTextarea, AtImagePicker, AtMessage} from "taro-ui";
import {uploadFile, atMessage, navigateTo} from "@tarojs/taro";
import _ from 'lodash'
import './index.scss'

const SportEdit = () => {
	const [loading, setLoading] = useState<boolean>(false)
	const [formData, setFormData] = useState<any>({title:''})
	const [imgFiles, setImageFiles] = useState<any[]>([])

	useEffect(() => {
		console.log('imgFiles:', imgFiles)
	}, [imgFiles]);


	const onSubmit = async () => {
		if (loading) return
		setLoading(true)
		console.log('formData:', formData)
		try {

			await uploadFile({
				// method: 'POST',
				url: `${process.env.TARO_APP_BASE_URL}/sport/add`,
				filePath: imgFiles[0]?.file.path,
				name: 'image',
				formData: {...formData, image: undefined},
				// data: formData,
				success: (res: any) => {
					if (res.data) {
						atMessage({
							message: '新增运动项目成功!',
							type: 'success'
						})
						setLoading(false)
						setTimeout(() => {
							setLoading(false)
							navigateTo({
								url: '/pages/sport/index'
							})
						}, 1500)
					}
				},
				fail: () => {
					setLoading(false)
				}
			})
		} catch (e: any) {
			setLoading(false)
			console.error(e)
			atMessage({
				message: `新增运动项目失败：${e.toString()}`,
				type: 'error'
			})
		}
	}

	const handleFormDataChange = (name: string, value: any) => {
		console.log("-> name", name);
		console.log("-> value", value);
		let tempData = _.cloneDeep(formData)
		tempData[name] = value
		setFormData(tempData)
	}

	return <View className='sport-edit'>
		<AtMessage />
		<AtForm onSubmit={onSubmit}>
			<AtInput
				name='title'
				title='标题'
				type='text'
				required
				placeholder='请输入标题'
				value={formData.title}
				onChange={(value: string) => handleFormDataChange('title', value)}
			/>
			<AtInput
				name='organizer'
				title='发起人'
				type='text'
				required
				placeholder='发起人姓名'
				value={formData.organizer}
				onChange={(value: string) => handleFormDataChange('organizer', value)}
			/>
			<AtInput
				name='tags'
				title='标签'
				type='text'
				placeholder='多个标签请用,分隔'
				value={formData.tags}
				onChange={(value: string) => handleFormDataChange('tags', value)}
			/>
			<Picker mode='date' value={formData.startDate}
					onChange={(e: any) => handleFormDataChange('startDate', e.detail.value)} >
				<AtList>
					<AtListItem title='请选择活动开始日期' extraText={formData.startDate} />
				</AtList>
			</Picker>
			<Picker mode='time' value={formData.startTime}
					onChange={(e: any) => handleFormDataChange('startTime', e.detail.value)} >
				<AtList>
					<AtListItem title='请选择活动开始时间' extraText={formData.startTime} />
				</AtList>
			</Picker>
			<Picker mode='date' value={formData.endDate}
					onChange={(e: any) => handleFormDataChange('endDate', e.detail.value)} >
				<AtList>
					<AtListItem title='请选择活动结束日期' extraText={formData.endDate} />
				</AtList>
			</Picker>
			<Picker mode='time' value={formData.endTime}
					onChange={(e: any) => handleFormDataChange('endTime', e.detail.value)} >
				<AtList>
					<AtListItem title='请选择活动结束时间' extraText={formData.endTime} />
				</AtList>
			</Picker>
			<View className="panel">
				<Text className="panel__title">活动图片</Text>
				<AtImagePicker
					files={imgFiles}
					// @ts-ignore
					onChange={(fiels: File[]) => setImageFiles(fiels)}  />
			</View>
			<View className="panel">
				<Text className="panel__title">活动内容</Text>
				<AtTextarea
					placeholder='请输入活动内容'
					value={formData.content}
					onChange={(value: string) => handleFormDataChange('content', value)}
				/>
			</View>
			<AtButton loading={loading} className='sport-edit-submit-button' formType='submit'>提交</AtButton>
			{/*<AtButton formType='reset'>重置</AtButton>*/}
		</AtForm>
	</View>
}

export default SportEdit
