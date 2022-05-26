import React, { useCallback, useEffect, useState } from 'react';
import { Emoji, EmojiProvider } from 'react-apple-emojis';
import { AbsoluteFill, Audio, Composition, continueRender, delayRender, Img, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import emojiData from './emoji-data.json';
import "./style.css";


interface JustContent {
	text: string,
	duration: number,
	start: number,
	audioFile: string,
	emoji: string[]
}

var img = Img

export const RemotionVideo: React.FC = () => {

	const baseUrl = 'https://storage.googleapis.com/tiktok-video-assets/video-assets'
	const projectId = process.env.REMOTION_PROJECT_ID //'aita_for_wearing_jeans_and_a_top_at_my_sisters'
	const projectAssets = `${baseUrl}/${projectId}`
	const scriptUrl = `${baseUrl}/${projectId}/script.json`

	const [content, setContent] = useState<JustContent[]>([])
	const [totalDuration, setTotalDuration] = useState(0)
	const [handle] = useState(() => delayRender())

	const fetchData = useCallback(async () => {
		console.log(scriptUrl)
		const headers = new Headers()
		headers.append('Content-Type', 'application/json');
		headers.append('Accept', 'application/json');
		headers.append('Origin', 'http://localhost:3000');
		const response = await fetch(scriptUrl, {})
		const json = await response.json()

		const parsedContent: JustContent[] = [json.title, ...json.script]
			.map(
				entry => ({
					text: entry.text,
					duration: Math.max(entry.duration, 1),
					audioFile: `${projectAssets}/sounds/${entry.audio_file}`,
					start: 0,
					emoji: [entry.emoji]
				})
			)
		setContent(parsedContent)
		setTotalDuration(
			Math.ceil(
				parsedContent.reduce(
					(acc, cur) => acc + cur.duration,
					0
				)
			)
		)

		continueRender(handle)
	}, [handle])

	useEffect(() => {
		fetchData()
	}, [])


	const FPS = 30;
	return (
		<>
			<Composition
				id="Main"
				component={Main}
				defaultProps={{
					content
				}}
				durationInFrames={FPS * Math.max(Math.ceil(totalDuration), 1)}
				fps={FPS}
				width={1080}
				height={1920}
			/>
		</>
	);
};


const Main: React.FC<{
	content: JustContent[]
}> = ({ content }) => {
	const { fps, durationInFrames } = useVideoConfig();
	return (
		<EmojiProvider data={emojiData}>
			<AbsoluteFill className='gradient-background'>
				{
					content
						.map(
							(curContent, i) => {
								return (
									<Sequence
										name={`Content ${i}`}
										key={`Content ${i}`}
										durationInFrames={Math.ceil((curContent.duration) * fps)}
										from={
											Math.floor(
												fps * content.slice(0, i)
													.reduce(
														(acc, cur) => acc + cur.duration,
														0
													)
											)
										}
									>
										<ContentSequence
											key={i}
											content={curContent}
											index={i}
											duration={(curContent.duration) * fps}
										/>
									</Sequence>
								)
							}
						)
				}
			</AbsoluteFill>
		</EmojiProvider >
	)
}

type ContentProps = {
	content: JustContent,
	index: number,
	duration: number
}

const ContentSequence = (props: ContentProps) => {
	const { content, index, duration } = props
	const frame = useCurrentFrame()
	const { fps, height, width } = useVideoConfig()

	const opacity = (offset: number) => {
		return Math.min(
			interpolate(frame - offset, [0, 10], [0, 1]),
			interpolate(frame - offset, [duration - 10, duration], [1, 0], {
				extrapolateLeft: 'clamp'
			}),
		)
	}
	const translate = (offset: number) => spring({ frame: frame - offset, fps, to: -20 })

	const factor = (index % 2 === 0 ? -1 : 1)
	const rotate = factor * random(index)
	const xMove = factor * random(index) * 20
	const yMove = factor * height / 2 * 0.3 * 0

	const emojiSize = 540 / content.emoji.length
	const emojiDisplacement = yMove * -1 * 0
	const numWords = content.text.split(" ").length

	console.log(({
		yMove,
		emojiDisplacement
	}))

	const pt = 150
	const pr = 150

	const EmojiComponent = () => (
		content.emoji.filter(e => !!e).length ? (
			<div style={{
				display: "flex",
				justifyContent: "center",
				width: "100%",
				opacity: opacity(0),
				transform: `rotate(${-5 * rotate}deg)`,
				marginTop: '10em',
				background: 'rgba(255, 255, 255, 0.5',
				padding: '5em',
				borderRadius: '20em',
			}}>
				{
					content.emoji.map(
						e => <Emoji key={e} name={e} width={emojiSize} />
					)
				}
			</div>
		) : null
	)
	const TextComponent = () => (
		<div style={{
			padding: "1em",
			paddingLeft: '4em',
			paddingRight: '4em',
			width: '100%',
			textAlign: "center",
			transform: `rotate(${3 * rotate}deg)`,
			background: 'black',
			color: 'white',
			borderRadius: '4em',
			opacity: opacity(0) * 0.95,
			maxWidth: "100%",
			marginTop: '10em'
		}}
		>
			<p style={{
				fontSize: '3.5em',
				textAlign: "center",
				fontFamily: "arial, sans-serif",
				fontWeight: "bold",
			}}>
				{
					content.text
						.split(' ')
						.map(
							(word, i) => (
								<span style={{
									display: 'inline-block',
									opacity: opacity(i),
									transform: `translateY(${translate(i)}px)`,
									marginLeft: 11
								}}
								>
									{word}
								</span>
							)
						)
				}
			</p>
		</div>
	)

	let ordering = [];
	if (factor > 0) {
		ordering = [
			EmojiComponent,
			TextComponent
		]
	}
	else {
		ordering = [
			TextComponent,
			EmojiComponent
		]
	}

	return (
		<AbsoluteFill>
			<div style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				marginRight: '10em',
				marginTop: '10em'
			}}>
				<div style={{
					padding: "5em"
				}}>
					{
						ordering.map(component => component())
					}
				</div>
			</div>
			<Audio src={content.audioFile} />
		</AbsoluteFill>
	)

}