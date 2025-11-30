type CustomerInfoPresenterProps = {
	firstName: string;
	lastName: string;
};

export function CustomerInfoPresenter({
	firstName,
	lastName,
}: CustomerInfoPresenterProps) {
	return (
		<h1 className="text-2xl font-bold h-9">
			{lastName} {firstName}
		</h1>
	);
}
