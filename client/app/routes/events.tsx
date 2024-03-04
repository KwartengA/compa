import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Anchor } from "~/components/anchor";
import { PostTime, postTime } from "~/components/post-time";
import { Username } from "~/components/username";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";
import { values } from "~/lib/values.server";

export const loader = async () => {
	const events = await prisma.eventItem.findMany({
		include: { user: true, poster: true },
	});

	return { events, school: values.meta() };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await checkAuth(request);
	const data = await request.json();

	const event = await prisma.eventItem.create({
		data: { ...data, date: new Date(data.date), userId },
	});

	return redirect(`/events/${event.id}`);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: `Events | ${data?.school.shortName} | compa` },
		{
			name: "description",
			content: "All the events happening on (and off) campus. Find them here.",
		},
	];
};

export default function Events() {
	const { events } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto min-h-[60vh]">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				<div className="col-span-1"> </div>

				<div className="col-span-1 lg:col-span-2">
					<header className="mb-2 flex justify-between">
						<div>
							<div className="bg-zinc-200 dark:bg-neutral-800 rounded-full px-2 py-0.5 inline font-medium text-sm">
								{events.length} events
							</div>
						</div>

						<div>
							<Anchor href="/events/add">
								<div className="i-lucide-plus opacity-60" /> Add event
							</Anchor>
						</div>
					</header>

					<ul>
						{events.map((event) => (
							<li key={event.id}>
								<EventItem event={event} />
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

interface EventItemProps {
	event: Prisma.EventItemGetPayload<{
		include: { user: true; poster: true };
	}>;
}

function EventItem({ event }: EventItemProps) {
	return (
		<Link
			to="/events/1"
			className="flex gap-4 hover:bg-zinc-100 dark:hover:bg-neutral-800 dark:hover:bg-opacity-50 px-2 rounded-lg"
		>
			<div className="w-4 relative">
				<div className="h-full bg-zinc-200 dark:bg-neutral-800 w-[3px] mx-auto" />
				<div className="absolute top-0 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-neutral-700 size-4 rounded-full" />
			</div>

			<div className="flex-1 mb-8">
				<header className="font-mono text-secondary text-sm">
					Fri, 3 Mar. 9.00pm till you drop
					<br />@{event.venue}
				</header>

				<h2 className="font-bold mt-2">{event.title}</h2>

				<p className="text-secondary">{event.shortDescription}</p>

				<div className="size-30 rounded-lg bg-zinc-200 dark:bg-neutral-800 md:hidden" />

				<p className="mt-2">{ellipsize(event.description, 80)}</p>

				<div className="text-xs font-mono mt-2 text-secondary">
					Posted <PostTime time={event.createdAt} /> by <Username user={event.user} />
				</div>
			</div>

			<div className="max-md:hidden">
				<div className="size-24 rounded-lg bg-zinc-200 dark:bg-neutral-800" />
			</div>
		</Link>
	);
}

function ellipsize(str: string, length: number) {
	return str.length > length ? `${str.slice(0, length)}…` : str;
}
